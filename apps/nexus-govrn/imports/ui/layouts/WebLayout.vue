<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay, useTheme } from "vuetify";
import { useI18n } from "vue-i18n";
import { NLocaleSelect } from "@nexus/ui";
import { navSections } from "../nav.js";
import { usePublicSetup } from "../usePublicSetup.js";
const route = useRoute();
const theme = useTheme();
const { lgAndUp } = useDisplay();
const { t, te } = useI18n();
const label = (key, fallback) => (te(key) ? t(key) : fallback);
const drawer = ref(lgAndUp.value);
watch(lgAndUp, (value) => {
  drawer.value = value;
});
watch(
  () => route.fullPath,
  () => {
    if (!lgAndUp.value) drawer.value = false;
  },
);
const { companyName, iconDataUrl, logoDataUrl } = usePublicSetup();
const title = computed(() => companyName.value || "INTELLEKTRA");
const hasContext = computed(() =>
  route.matched.some((record) => record.components?.context),
);
const routePageKey = computed(() => String(route.name || route.path));
const routeContextKey = computed(() => route.fullPath);

function navItemLink(item) {
  if (!item.path || item.path === "#") {
    return { href: "#" };
  }
  return { to: item.path };
}
</script>
<template>
  <!-- Your existing root component owns the single v-app. -->
  <a href="#main-content" class="app-skip">
    {{ label("a11y.skip", "Skip to main content") }}
  </a>
  <v-navigation-drawer
    v-model="drawer"
    :temporary="!lgAndUp"
    class="app-navigation"
    color="surface"
    :width="232"
  >
    <div class="app-brand">
      <v-img
        v-if="logoDataUrl"
        :src="logoDataUrl"
        :alt="title"
        max-height="36"
      />
      <template v-else>
        <v-avatar v-if="iconDataUrl" size="28">
          <v-img :src="iconDataUrl" :alt="title" />
        </v-avatar>
        <span v-else class="app-brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{{ title }}</span>
      </template>
    </div>
    <v-divider />
    <v-list
      nav
      color="primary"
      :aria-label="label('nav.main', 'Main navigation')"
    >
      <template v-for="section in navSections" :key="section.key">
        <v-list-subheader>
          {{ label("nav.section." + section.key, section.fallback) }}
        </v-list-subheader>
        <v-list-item
          v-for="item in section.items"
          :key="section.key + '-' + item.key"
          v-bind="navItemLink(item)"
          :exact="item.path === '/'"
          :title="label('nav.' + item.key, item.fallback)"
          :prepend-icon="item.icon"
        />
      </template>
    </v-list>
    <template #append>
      <v-list nav>
        <v-list-item
          to="/settings"
          prepend-icon="mdi-cog-outline"
          :title="label('nav.settings', 'Settings')"
        />
        <v-list-item
          to="/help"
          prepend-icon="mdi-help-circle-outline"
          :title="label('nav.help', 'Help')"
        />
      </v-list>
      <div class="app-nav-footer app-small app-muted">
        {{ title }}
        <br />
        {{
          label(
            "brand.tagline",
            "Regulatory insight for a more resilient tomorrow.",
          )
        }}
      </div>
    </template>
  </v-navigation-drawer>
  <v-app-bar height="64" class="app-toolbar">
    <v-app-bar-nav-icon
      :aria-label="label('nav.toggle', 'Toggle navigation')"
      @click="drawer = !drawer"
    />
    <v-text-field
      class="app-toolbar-search"
      variant="solo"
      flat
      density="compact"
      hide-details
      prepend-inner-icon="mdi-magnify"
      :placeholder="
        label(
          'search.placeholder',
          'Search firms, submissions or reference numbers…',
        )
      "
      :aria-label="label('search.global', 'Global search preview')"
      readonly
    />
    <v-spacer />
    <n-locale-select class="ms-2" />
    <v-btn
      icon="mdi-theme-light-dark"
      variant="text"
      :aria-label="label('themeToggle', 'Toggle colour theme')"
      @click="theme.toggle()"
    />
    <router-link class="app-user text-decoration-none" to="/account">
      <v-avatar color="primary" variant="tonal" size="36">KA</v-avatar>
      <span class="app-user-name">Karmil Asgarally</span>
    </router-link>
  </v-app-bar>
  <v-main class="app-main">
    <div id="main-content" class="app-page" tabindex="-1">
      <router-view name="heading" v-slot="{ Component }">
        <transition name="app-route-fade" mode="out-in">
          <component :is="Component" v-if="Component" :key="routePageKey" />
        </transition>
      </router-view>
      <div
        class="app-workspace"
        :class="{ 'app-workspace--context': hasContext }"
      >
        <section :aria-label="label('workspace.content', 'Main content')">
          <router-view v-slot="{ Component }">
            <transition name="app-route-fade" mode="out-in">
              <component :is="Component" v-if="Component" :key="routePageKey" />
            </transition>
          </router-view>
        </section>
        <aside
          v-if="hasContext"
          id="record-context"
          class="app-context"
          :aria-label="label('workspace.context', 'Record context')"
        >
          <router-view name="context" v-slot="{ Component }">
            <transition name="app-route-fade" mode="out-in">
              <component
                :is="Component"
                v-if="Component"
                :key="routeContextKey"
              />
            </transition>
          </router-view>
        </aside>
      </div>
    </div>
  </v-main>
</template>
