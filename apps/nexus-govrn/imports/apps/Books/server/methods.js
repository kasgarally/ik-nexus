/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * books.insert / books.update / books.remove
 *
 * Fields on a book:
 *   title (required string)
 *   description, author, aboutAuthor, publisher, language, isbn, category (optional strings)
 *   publishedOn (Date or null)
 *   createdAt, updatedAt (Date, server-set)
 *   createdBy (user id on insert)
 * Cover and PDF live in nexus_files (owner types bookCover and bookPdf).
 */
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { Files } from '@nexus/files'
import { Books } from '../collection.js'

const OPTIONAL_STRING = Match.Maybe(String)

export function registerBookMethods() {
  Meteor.methods({
    async 'books.insert'(params) {
      check(params, {
        title: String,
        description: OPTIONAL_STRING,
        author: OPTIONAL_STRING,
        aboutAuthor: OPTIONAL_STRING,
        publisher: OPTIONAL_STRING,
        publishedOn: Match.Maybe(Match.OneOf(Date, String, null)),
        language: OPTIONAL_STRING,
        isbn: OPTIONAL_STRING,
        category: OPTIONAL_STRING,
      })

      const userId = requireLoggedIn(this.userId)
      await requireBookRole(userId, 'books.create')

      const now = new Date()
      const document = {
        title: requireTitle(params.title),
        description: readOptionalString(params.description),
        author: readOptionalString(params.author),
        aboutAuthor: readOptionalString(params.aboutAuthor),
        publisher: readOptionalString(params.publisher),
        publishedOn: readPublishedOn(params.publishedOn),
        language: readOptionalString(params.language),
        isbn: readOptionalString(params.isbn),
        category: readOptionalString(params.category),
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      }

      return Books.insertAsync(document)
    },

    async 'books.update'(params) {
      check(params, {
        id: String,
        title: String,
        description: OPTIONAL_STRING,
        author: OPTIONAL_STRING,
        aboutAuthor: OPTIONAL_STRING,
        publisher: OPTIONAL_STRING,
        publishedOn: Match.Maybe(Match.OneOf(Date, String, null)),
        language: OPTIONAL_STRING,
        isbn: OPTIONAL_STRING,
        category: OPTIONAL_STRING,
      })

      const userId = requireLoggedIn(this.userId)
      await requireBookRole(userId, 'books.update')

      const existing = await Books.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('book-not-found', 'No book for that id')
      }

      await Books.updateAsync(params.id, {
        $set: {
          title: requireTitle(params.title),
          description: readOptionalString(params.description),
          author: readOptionalString(params.author),
          aboutAuthor: readOptionalString(params.aboutAuthor),
          publisher: readOptionalString(params.publisher),
          publishedOn: readPublishedOn(params.publishedOn),
          language: readOptionalString(params.language),
          isbn: readOptionalString(params.isbn),
          category: readOptionalString(params.category),
          updatedAt: new Date(),
        },
      })

      return params.id
    },

    async 'books.remove'(params) {
      check(params, { id: String })

      const userId = requireLoggedIn(this.userId)
      await requireBookRole(userId, 'books.remove')

      const existing = await Books.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('book-not-found', 'No book for that id')
      }

      await removeBookFiles(params.id)
      await Books.removeAsync(params.id)
      return params.id
    },
  })
}

function requireLoggedIn(userId) {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be signed in')
  }
  return userId
}

async function requireBookRole(userId, role) {
  const allowed = await Roles.userIsInRoleAsync(userId, role)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', `Missing role ${role}`)
  }
}

function requireTitle(value) {
  const title = String(value || '').trim()
  if (!title) {
    throw new Meteor.Error('invalid-title', 'Title is required')
  }
  return title
}

function readOptionalString(value) {
  if (value == null) {
    return ''
  }
  return String(value).trim()
}

function readPublishedOn(value) {
  if (value == null || value === '') {
    return null
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Meteor.Error('invalid-published-on', 'publishedOn must be a valid date')
    }
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Meteor.Error('invalid-published-on', 'publishedOn must be a valid date')
  }
  return parsed
}

async function removeBookFiles(ownerId) {
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
