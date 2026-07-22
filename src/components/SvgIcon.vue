<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- check-circle -->
    <template v-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-5" />
    </template>

    <!-- close-circle -->
    <template v-else-if="name === 'close-circle'">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </template>

    <!-- clipboard -->
    <template v-else-if="name === 'clipboard'">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </template>

    <!-- graduate -->
    <template v-else-if="name === 'graduate'">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 2 2.5 4 6 4s6-2 6-4v-5" />
    </template>

    <!-- admin -->
    <template v-else-if="name === 'admin'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </template>

    <!-- rotate -->
    <template v-else-if="name === 'rotate'">
      <path d="M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.8 3" />
      <path d="M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.8-3" />
      <polyline points="21 8 21 12 17 12" />
      <polyline points="3 16 3 12 7 12" />
    </template>

    <!-- document -->
    <template v-else-if="name === 'document'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </template>

    <!-- calendar -->
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </template>

    <!-- hospital -->
    <template v-else-if="name === 'hospital'">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
      <path d="M12 8v8M8 12h8" />
    </template>

    <!-- pin -->
    <template v-else-if="name === 'pin'">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </template>

    <!-- warning -->
    <template v-else-if="name === 'warning'">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </template>

    <!-- return -->
    <template v-else-if="name === 'return'">
      <polyline points="15 18 9 12 15 6" />
      <path d="M9 12h8a4 4 0 0 1 0 8h-1" />
    </template>

    <!-- forbidden -->
    <template v-else-if="name === 'forbidden'">
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 14.14 14.14" />
    </template>

    <!-- info -->
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  }
})

const viewBox = '0 0 24 24'
</script>
