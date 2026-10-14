<template>

<v-button
  ref="button"
  class="v-filter"
  :class="{ 'v-selected': hasFilter }"
  icon="fa-hashtag"
  @click.prevent.stop="open"
/>

    <Teleport to="body">
      <v-panel
        ref="panel"
        class="popup"
        v-show="visible"
        style="
          text-align: left;
          position: absolute;
          padding: 0px !important;
        "
        :header="panelTitle"
      >
        <div style="padding: 20px">
          <div class="v-form">
            <div
              v-for="(filter, index) in filters"
              :key="index"
              style="
                display: flex;
                align-items: center;
                gap: 5px;
                margin-bottom: 5px;
              "
            >
              <select v-model="filter.operator" style="padding-left: 20px;padding-right: 20px;width: 80px;">
                <option value=">=">&gt;=</option>
                <option value=">">&gt;</option>
                <option value="=">=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
              </select>

              <input
                v-model="filter.value"
                type="number"
                style="width: 120px;flex:1"
              />

              <v-button
                icon="fa-trash"
                @click.prevent="removeFilter(index)"
              />
            </div>

            <div style="padding-top: 5px" class="right">
              <v-button
                icon="fa-plus"
                @click.prevent="addFilter"
              />
            </div>
          </div>

          <center style="padding-top: 20px">
            <v-button
              icon="fa-check"
              value="Aceptar"
              @click="accept"
            />

            <v-button
              icon="fa-times"
              value="Limpiar"
              @click="clear"
            />

            <v-button
              icon="fa-ban"
              value="Cancelar"
              @click.prevent="cancel"
            />
          </center>
        </div>
      </v-panel>
    </Teleport>

</template>

<script setup>
import {
  computed,
  nextTick,
  ref,
} from "vue";

import {
  mask,
  unmask,
} from "./commons";

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },

  name: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:modelValue",
]);

const panel = ref(null);
const visible = ref(false);

const button = ref(null);

function getHeader() {
  const el = button.value?.$el ?? button.value;
  return el
    ?.closest("th")
    ?.getAttribute("header") || "";
}

const filters = ref([
  createEmptyFilter(),
]);

let currentMask = null;

const hasFilter = computed(() => {
  return !!props.modelValue;
});

const fieldName = ref("");

const panelTitle = computed(() => {
  const name = props.name || fieldName.value;

  return name
    ? `Filtro [${name}]`
    : "Filtro Fecha";
});

function createEmptyFilter() {
  return {
    operator: "=",
    value: null,
  };
}

function getPanelElement() {
  return panel.value?.$el ?? panel.value;
}

async function open() {
  fieldName.value = getHeader();

  loadFilters();

  visible.value = true;

  await nextTick();

  const el = getPanelElement();

  if (!el) {
    return;
  }

  currentMask = mask(el);
}

function close() {
  visible.value = false;

  if (currentMask) {
    unmask(currentMask);
    currentMask = null;
  }
}

function addFilter() {
  filters.value.push(
    createEmptyFilter(),
  );
}

function removeFilter(index) {
  filters.value.splice(index, 1);

  if (filters.value.length === 0) {
    filters.value.push(
      createEmptyFilter(),
    );
  }
}

function accept() {
  const value = filters.value
    .filter(filter => {
      return (
        filter.value !== null &&
        filter.value !== ""
      );
    })
    .map(filter => {
      return `${filter.operator}${filter.value}`;
    })
    .join("&");

  emit(
    "update:modelValue",
    value || null,
  );

  close();
}

function clear() {
  emit(
    "update:modelValue",
    null,
  );

  filters.value = [
    createEmptyFilter(),
  ];

  close();
}

function cancel() {
  close();
}

function loadFilters() {
  if (!props.modelValue) {
    filters.value = [
      createEmptyFilter(),
    ];

    return;
  }

  const parsed = props.modelValue
    .split("&")
    .map(parseFilter)
    .filter(filter => filter !== null);

  filters.value =
    parsed.length > 0
      ? parsed
      : [createEmptyFilter()];
}

function parseFilter(expression) {
  const match = expression.match(
    /^(>=|<=|>|<|=)(-?\d+(?:\.\d+)?)$/,
  );

  if (!match) {
    return null;
  }

  return {
    operator: match[1],
    value: match[2],
  };
}
</script>

