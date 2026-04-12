import { mount } from '@vue/test-utils'

import CardGrid from './src/components/CardGrid.vue'

const cards = [
  {
    id: 1,
    name: 'A',
    hp: 10,
    attack: 1,
    type: 'Fire',
    pokedexNumber: 1,
    imgUrl: 'x',
  },
  {
    id: 2,
    name: 'B',
    hp: 10,
    attack: 1,
    type: 'Water',
    pokedexNumber: 2,
    imgUrl: 'x',
  },
  {
    id: 3,
    name: 'C',
    hp: 10,
    attack: 1,
    type: 'Grass',
    pokedexNumber: 3,
    imgUrl: 'x',
  },
] as const

describe('CardGrid', () => {
  it('sélectionne / désélectionne au clic (RG5)', async () => {
    const wrapper = mount(CardGrid, {
      props: { cards: [...cards], selectable: true, modelValue: [] },
    })

    await wrapper.get('[data-testid="pokemon-card-1"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual([1])
  })

  it('désactive les cartes non sélectionnées quand le max est atteint (RG6)', async () => {
    const wrapper = mount(CardGrid, {
      props: {
        cards: [...cards],
        selectable: true,
        maxSelected: 2,
        modelValue: [1, 2],
      },
    })

    const card3 = wrapper.get('[data-testid="pokemon-card-3"]')
    expect(card3.classes()).toContain('card--disabled')

    await card3.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
