<template>
    <div :class="`bg-${color}-100 border-l-4 border-${color}-500 p-4 rounded-2xl shadow-md`">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-${color}-800">{{ title }}</h2>
        <component :is="iconComponent" class="w-6 h-6 text-${color}-600" />
      </div>
      <div>
        <slot />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { BarChart, ShoppingCart, Users, ClipboardList, AlertTriangle, DollarSign } from 'lucide-vue-next'
  
  const props = defineProps({
    title: String,
    color: {
      type: String,
      default: 'blue',
    },
    icon: String,
  })
  
  const iconMap = {
    'bar-chart': BarChart,
    'shopping-cart': ShoppingCart,
    users: Users,
    'clipboard-list': ClipboardList,
    'alert-triangle': AlertTriangle,
    'dollar-sign': DollarSign,
  }
  
  const iconComponent = computed(() => iconMap[props.icon] || BarChart)
  </script>
  