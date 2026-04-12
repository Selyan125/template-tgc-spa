import { mount } from '@vue/test-utils'

import PokemonCard from './src/components/PokemonCard.vue'

const card = {
  id: 1,
  name: 'Bulbasaur',
  hp: 100,
  attack: 20,
  type: 'Grass',
  pokedexNumber: 1,
  imgUrl: 'https://example.com/bulbasaur.png',
} as const

describe('PokemonCard', () => {
  it('affiche les infos principales (RG1)', () => {
    const wrapper = mount(PokemonCard, {
      props: { card },
    })

    expect(wrapper.text()).toContain('#001')
    expect(wrapper.text()).toContain('Bulbasaur')
    expect(wrapper.text()).toContain('Grass')
    expect(wrapper.text()).toContain('HP')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('ATK')
    expect(wrapper.text()).toContain('20')
  })

  it('applique les états selected/disabled (RG3)', () => {
    const wrapper = mount(PokemonCard, {
      props: { card, selected: true, disabled: true },
    })

    expect(wrapper.classes()).toContain('card--selected')
    expect(wrapper.classes()).toContain('card--disabled')
  })

  it('affiche une barre de HP courants si fourni (RG4)', () => {
    const wrapper = mount(PokemonCard, {
      props: { card, currentHp: 50 },
    })

    expect(wrapper.text()).toContain('50 / 100')
    expect(wrapper.find('.hpbar__fill').exists()).toBe(true)
  })
})
