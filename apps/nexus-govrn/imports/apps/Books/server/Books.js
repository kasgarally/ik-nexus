import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check } from 'meteor/check'
import { Roles } from 'meteor/roles'

const collection = new Mongo.Collection('books')

const schema = new SimpleSchema({
  title: { type: String, label: 'Title', },
  description: { type: String, label: 'Description',},
  author: { type: String, label: 'Author',},
  publishedOn: { type: Date, label: 'Published On',},
  language: { type: String, label: 'Language',},
  isbn: { type: String, label: 'ISBN',},
  docOwner: { 
    type: String, 
    label: 'Document Owner', 
    autoValue: function () {
      if (this.isInsert && this.userId) {
        return this.userId
      }
    },
    optional: true,
  },
})

collection.attachSchema(schema)

Meteor.methods({

  'books.insert'(docData) {
    // Check RBAC
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'books.create'])) {
      throw new Meteor.Error('Permission denied')
    }

    try {
      const docId = collection.insertAsync(docData)

      // Log the event
      
      return docId
    } catch (error) {
      throw new Meteor.Error('Error inserting book', error.message)
    }
  },
})

export { collection as Books }