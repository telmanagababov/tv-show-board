<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import './i18n'

import { usePersonStore } from './stores/person.store'
import BackButton from '@/shared/components/BackButton.vue'
import LoadingIndicator from '@/shared/components/LoadingIndicator.vue'
import ErrorState from '@/shared/components/ErrorState.vue'
import ShowList from '@/shared/components/ShowList.vue'
import PersonPhoto from './components/PersonPhoto.vue'
import PersonInfo from './components/PersonInfo.vue'

const { t } = useI18n()
const store = usePersonStore()
const props = defineProps<{ id: string }>()
const person = computed(() => store.person)

/**
 * Watch the route parameter `id` and fetch the person details when it changes.
 */
watch(
  () => props.id,
  (id) => store.fetchPersonDetails(Number(id)),
  { immediate: true },
)
onUnmounted(() => store.clearPersonDetails())
</script>

<template>
  <div class="bg-bg text-fg min-h-screen">
    <!-- Back button -->
    <div class="mx-auto max-w-5xl px-6 pt-6">
      <BackButton />
    </div>

    <!-- Loading state -->
    <div v-if="store.loading" class="flex min-h-[60vh] items-center justify-center" data-testid="person-loading">
      <LoadingIndicator size="lg" />
    </div>

    <!-- Error state -->
    <div v-else-if="store.error" class="mx-auto max-w-5xl px-6 py-16" data-testid="person-error">
      <ErrorState :message="t(store.error)" @retry="store.fetchPersonDetails(Number(props.id))" />
    </div>

    <!-- Person details -->
    <article v-else-if="person" class="mx-auto max-w-5xl px-6 py-8" data-testid="person-content">
      <!-- Header: photo + info -->
      <div class="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div class="shrink-0 sm:w-40 md:w-48" data-testid="person-photo-wrapper">
          <PersonPhoto :image="person.image" :name="person.name" />
        </div>
        <PersonInfo :person="person" />
      </div>

      <!-- Show credits -->
      <section class="mt-10" data-testid="person-credits-section">
        <h2 class="text-fg mb-4 text-xl font-semibold">{{ t('person.credits') }}</h2>
        <ShowList
          :shows="person.showCredits"
          :label="t('person.creditsAriaLabel', { name: person.name })"
          :empty-text="t('person.noCredits')"
        />
      </section>
    </article>
  </div>
</template>
