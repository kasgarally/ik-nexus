/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Vue client bootstrap
 */
import { Meteor } from 'meteor/meteor'
import { registerNexusApplog } from '/imports/api/nexusApplog.js'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'
import { registerNexusLists } from '/imports/api/nexusLists.js'
import { registerNexusSetup } from '/imports/api/nexusSetup.js'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { VueMeteor } from 'vue-meteor-tracker'
import { i18n } from './i18n/index.js'
import { router } from './router.js'
import { vuetifyConfig } from './vuetify.config.js'
import App from './App.vue'

import 'vuetify/styles'
import './main.css'

registerNexusFiles()
registerNexusLists()
registerNexusSetup()
registerNexusApplog()

const app = createApp(App)
const vuetify = createVuetify(vuetifyConfig)

app.use(VueMeteor)
app.use(i18n)
app.use(router)
app.use(createPinia())
app.use(vuetify)

Meteor.startup(() => {
  app.mount('#app')
})
