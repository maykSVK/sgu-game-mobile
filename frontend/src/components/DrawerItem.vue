<template>
  <RouterLink
    :to="item.to"
    class="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors active:scale-95 relative"
    :class="isActive ? 'bg-sgu-blue/40 text-white' : 'text-sgu-text/80 hover:bg-white/5'"
    @click.prevent="$emit('click')"
  >
    <!-- Active indicator -->
    <div v-if="isActive"
         class="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
         style="background: #209cff; box-shadow: 0 0 6px #209cff;"></div>

    <span class="text-xl w-7 text-center shrink-0">{{ item.icon }}</span>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold truncate" :class="isActive ? 'text-sgu-accent' : ''">
        {{ item.label }}
      </div>
      <div v-if="item.sub" class="text-[10px] text-sgu-text/40 truncate">{{ item.sub }}</div>
    </div>
    <span class="text-sgu-text/20 text-xs">›</span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: { type: Object, required: true },
})
defineEmits(['click'])

const route = useRoute()
const isActive = computed(() =>
  props.item.to === '/' ? route.path === '/' : route.path.startsWith(props.item.to)
)
</script>
