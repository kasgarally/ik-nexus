/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Books collection: schema, deny, methods, publications
 *
 * 1. Constants
 * 2. Collection
 * 3. Schema
 * 4. Deny client writes
 * 5. Server methods and publications
 * 6. Indexes
 */
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Files } from '@nexus/files'
import { appLocales, coerceLocalized, resolveLocalized } from '/imports/api/appLocales.js'
import { localizedStringSchema } from '/imports/api/localizedString.js'
import { denyClientWrites, requireLoggedIn, requireRole, SimpleSchema, validateDocument } from '/imports/api/methodHelpers.js'

const collectionName = 'books'
const rolePrefix = collectionName

export const BOOK_PROSE_FIELDS = ['title', 'description', 'author', 'aboutAuthor', 'publisher']

export const Books = new Mongo.Collection(collectionName)

export const bookSchema = new SimpleSchema({
  title: { type: localizedStringSchema(), label: 'Title' },
  description: { type: localizedStringSchema({ optional: true }), optional: true, label: 'Description' },
  author: { type: localizedStringSchema({ optional: true }), optional: true, label: 'Author' },
  aboutAuthor: { type: localizedStringSchema({ optional: true }), optional: true, label: 'About the author' },
  publisher: { type: localizedStringSchema({ optional: true }), optional: true, label: 'Publisher' },
  publishedOn: { type: Date, optional: true, label: 'Published on' },
  language: { type: String, optional: true, defaultValue: '', label: 'Language' },
  isbn: { type: String, optional: true, defaultValue: '', label: 'ISBN' },
  category: { type: String, optional: true, defaultValue: '', label: 'Category' },
})

denyClientWrites(Books)

if (Meteor.isServer) {
  Meteor.methods({
    async [`${collectionName}.insert`](params) {
      check(params, Object)
      const userId = requireLoggedIn(this.userId)
      await requireRole(userId, `${rolePrefix}.create`)

      const fields = readFormFields(params)
      const doc = await validateDocument(bookSchema, fields)
      const now = new Date()
      return Books.insertAsync({
        ...doc,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      })
    },

    async [`${collectionName}.update`](params) {
      check(params, Object)
      check(params.id, String)
      const userId = requireLoggedIn(this.userId)
      await requireRole(userId, `${rolePrefix}.update`)

      const existing = await Books.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('not-found', 'No document for that id')
      }

      const fields = readFormFields(params)
      const doc = await validateDocument(bookSchema, fields)
      await Books.updateAsync(params.id, {
        $set: {
          title: doc.title,
          description: doc.description,
          author: doc.author,
          aboutAuthor: doc.aboutAuthor,
          publisher: doc.publisher,
          publishedOn: doc.publishedOn ?? null,
          language: doc.language,
          isbn: doc.isbn,
          category: doc.category,
          updatedAt: new Date(),
        },
      })
      return params.id
    },

    async [`${collectionName}.remove`](params) {
      check(params, { id: String })
      const userId = requireLoggedIn(this.userId)
      await requireRole(userId, `${rolePrefix}.remove`)

      const existing = await Books.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('not-found', 'No document for that id')
      }

      await removeOwnedFiles(params.id)
      await Books.removeAsync(params.id)
      return params.id
    },
  })

  Meteor.publish(`${collectionName}.list`, function publishList() {
    if (!this.userId) {
      return this.ready()
    }
    return Books.find({}, { sort: { createdAt: -1 } })
  })

  Meteor.publish(`${collectionName}.one`, function publishOne(id) {
    check(id, String)
    if (!this.userId) {
      return this.ready()
    }
    return Books.find({ _id: id })
  })

  Meteor.startup(() => {
    void Promise.all([
      Books.createIndexAsync({ [`title.${appLocales.defaultData}`]: 1 }),
      Books.createIndexAsync({ createdAt: -1 }),
      Books.createIndexAsync({ category: 1 }),
    ])
  })
}

export function localizedBookField(value, locale) {
  return resolveLocalized(value, locale, appLocales)
}

function readFormFields(params) {
  const fields = { ...params }
  delete fields.id
  for (const name of BOOK_PROSE_FIELDS) {
    fields[name] = coerceLocalized(fields[name], appLocales)
  }
  if (fields.publishedOn === '' || fields.publishedOn == null) {
    delete fields.publishedOn
  }
  if (fields.category == null) {
    fields.category = ''
  }
  return fields
}

async function removeOwnedFiles(ownerId) {
  const files = await Files.collection
    .find({
      ownerType: { $in: ['bookCover', 'bookPdf'] },
      ownerId,
    })
    .fetchAsync()

  for (const file of files) {
    await Files.remove(file._id)
  }
}
