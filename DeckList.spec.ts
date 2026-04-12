import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { defineComponent } from 'vue'

import DeckList from './src/components/DeckList.vue'

const apiMock = {
  getMyDecks: vi.fn(),
  deleteDeck: vi.fn(),
}

vi.mock('./src/composables/useApi.js', () => {
  return {
    useApi: () => apiMock,
  }
})

const Stub = (tag: string) =>
  defineComponent({
    name: tag,
    template: `<div><slot /></div>`,
  })

const StubButton = defineComponent({
  name: 'NButton',
  props: {
    disabled: Boolean,
  },
  emits: ['click'],
  template: `<button :disabled="disabled" @click="$emit('click')"><slot /></button>`,
})

const RouterLinkStub = defineComponent({
  name: 'RouterLink',
  props: {
    to: { type: [String, Object], required: true },
  },
  template: `<a :href="typeof to === 'string' ? to : (to.path || '')"><slot /></a>`,
})

describe('DeckList', () => {
  it('charge les decks au montage et rafraîchit après suppression (RG1, RG3)', async () => {
    apiMock.getMyDecks
      .mockResolvedValueOnce([
        { id: 1, name: 'Deck 1', userId: 1, cards: [] },
        { id: 2, name: 'Deck 2', userId: 1, cards: [] },
      ])
      .mockResolvedValueOnce([{ id: 2, name: 'Deck 2', userId: 1, cards: [] }])

    apiMock.deleteDeck.mockResolvedValueOnce({})

    const wrapper = mount(DeckList, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          NCard: Stub('NCard'),
          NSpace: Stub('NSpace'),
          NText: Stub('NText'),
          NAlert: Stub('NAlert'),
          NEmpty: Stub('NEmpty'),
          NButton: StubButton,
        },
      },
    })

    await flushPromises()
    expect(apiMock.getMyDecks).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Deck 1')
    expect(wrapper.text()).toContain('Deck 2')

    const deleteButtons = wrapper
      .findAll('button')
      .filter((b) => b.text() === 'Supprimer')
    expect(deleteButtons.length).toBeGreaterThan(0)

    await deleteButtons[0].trigger('click')
    await flushPromises()

    expect(apiMock.deleteDeck).toHaveBeenCalledWith(1)
    expect(apiMock.getMyDecks).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Deck 1')
    expect(wrapper.text()).toContain('Deck 2')
  })
})
