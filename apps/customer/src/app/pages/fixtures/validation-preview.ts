import { animalDetailsFixture, type AnimalDetailsView } from './animal-details'

export const detailsValidationFixture: AnimalDetailsView = {
  ...animalDetailsFixture,
  values: { symptoms: ['other'], 'symptoms:other': 'Poranenie', conscious: 'yes', juvenile: 'no' },
  validation: {
    formErrors: ['Skontrolujte doplňujúce informácie o zvierati.'],
    fieldErrors: {
      conscious: ['Overte, či je zviera pri vedomí.'],
      'symptoms:other': ['Popíšte poranenie podrobnejšie.']
    }
  }
}
