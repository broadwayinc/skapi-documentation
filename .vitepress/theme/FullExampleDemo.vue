<script setup lang="ts">
// A link to one page of the full example on the CDN, with the reader's project
// id in ?pid=. The template runs against whatever project that id names, so
// without one the demo cannot work: the id is asked for once, kept in this
// browser (localStorage) and reused by every demo link on these pages. The
// Templates card on the project page at skapi.com offers the same links with
// the id already filled in.
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  /** File name on the CDN, for example "database.html". */
  page: string
  /** Link text. */
  label?: string
}>()

const BASE = 'https://cdn.broadwayinc.com/temp/v2/'
const KEY = 'skapi-docs:project-id'
const pid = ref('')

onMounted(() => {
  try {
    pid.value = localStorage.getItem(KEY) || ''
  } catch {
    /* private mode or blocked storage: the field still works for this page */
  }
})

function save() {
  const value = pid.value.trim()
  try {
    if (value) localStorage.setItem(KEY, value)
    else localStorage.removeItem(KEY)
  } catch {
    /* see above */
  }
}

const ready = computed(() => pid.value.trim().length > 0)
const href = computed(() => {
  const url = new URL(props.page, BASE)
  if (ready.value) url.searchParams.set('pid', pid.value.trim())
  return url.href
})
</script>

<template>
  <div class="demo-box">
    <label class="demo-field">
      <span class="demo-label">Your project ID</span>
      <input
        v-model="pid"
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="Paste the project ID from your project's page"
        @input="save"
      />
    </label>
    <a v-if="ready" class="demo-link" :href="href" target="_blank" rel="noopener">{{ label || 'Open the demo' }} &rarr;</a>
    <span v-else class="demo-hint">Enter your project ID to open the demo.</span>
  </div>
</template>

<style scoped>
.demo-box {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 20px;
  margin: 16px 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.demo-field {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.demo-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.demo-field input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.demo-field input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.demo-link {
  padding: 8px 14px;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.demo-link:hover {
  background: var(--vp-c-brand-2);
  color: var(--vp-c-white);
}

.demo-hint {
  padding: 8px 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}
</style>
