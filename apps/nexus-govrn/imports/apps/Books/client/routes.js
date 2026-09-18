/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Books named-view routes — static /categories before /:id
 */
import ScrBookCategoriesHeading from '../screens/ScrBookCategoriesHeading.vue'
import ScrBooksHeading from '../screens/ScrBooksHeading.vue'
import VewBook from '../views/VewBook.vue'
import VewBookCategories from '../views/VewBookCategories.vue'
import VewBooks from '../views/VewBooks.vue'

export const bookRoutes = [
  {
    path: '/books/categories',
    name: 'bookCategories',
    components: {
      heading: ScrBookCategoriesHeading,
      default: VewBookCategories,
    },
    meta: { layout: 'web' },
  },
  {
    path: '/books/:id?',
    name: 'books',
    components: {
      heading: ScrBooksHeading,
      default: VewBooks,
      context: VewBook,
    },
    meta: { layout: 'web' },
  },
]
