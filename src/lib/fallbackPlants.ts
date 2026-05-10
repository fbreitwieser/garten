import type { PlantsData } from './types';

export const fallbackPlants: PlantsData = {
  version: 'fallback',
  plants: [
    { id: 'tomato', names: { en: 'Tomato', de: 'Tomate', fr: 'Tomate', la: 'Solanum lycopersicum' }, synonyms: ['love apple', 'tomaten'], helps: ['basil', 'carrot', 'parsley', 'marigold'], avoid: ['fennel', 'kohlrabi'], comments: 'Classic companion for basil.' },
    { id: 'basil', names: { en: 'Basil', de: 'Basilikum', fr: 'Basilic', la: 'Ocimum basilicum' }, synonyms: [], helps: ['tomato', 'pepper'], avoid: ['sage'], comments: 'Said to repel aphids near tomatoes.' },
    { id: 'carrot', names: { en: 'Carrot', de: 'Möhre', fr: 'Carotte', la: 'Daucus carota' }, synonyms: ['mohren', 'karotte', 'mohre'], helps: ['tomato', 'leek', 'rosemary', 'marigold'], avoid: ['dill'], comments: '' },
    { id: 'fennel', names: { en: 'Fennel', de: 'Fenchel', fr: 'Fenouil', la: 'Foeniculum vulgare' }, synonyms: ['fenouil'], helps: [], avoid: ['tomato', 'pepper', 'carrot', 'basil'], comments: 'Allelopathic — inhibits many vegetables.' },
    { id: 'leek', names: { en: 'Leek', de: 'Lauch', fr: 'Poireau', la: 'Allium porrum' }, synonyms: ['poireau'], helps: ['carrot', 'celery'], avoid: [], comments: '' },
    { id: 'kohlrabi', names: { en: 'Kohlrabi', de: 'Kohlrabi', fr: 'Chou-rave', la: 'Brassica oleracea var. gongylodes' }, synonyms: [], helps: ['beet', 'onion'], avoid: ['tomato', 'pepper'], comments: '' },
    { id: 'parsley', names: { en: 'Parsley', de: 'Petersilie', fr: 'Persil', la: 'Petroselinum crispum' }, synonyms: [], helps: ['tomato', 'asparagus'], avoid: [], comments: '' },
    { id: 'marigold', names: { en: 'Marigold', de: 'Ringelblume', fr: 'Souci', la: 'Calendula officinalis' }, synonyms: ['ringelblume', 'souci'], helps: ['tomato', 'carrot'], avoid: [], comments: 'Repels nematodes and whitefly.' },
    { id: 'onion', names: { en: 'Onion', de: 'Zwiebel', fr: 'Oignon', la: 'Allium cepa' }, synonyms: ['zwiebel', 'oignon'], helps: ['carrot', 'lettuce', 'beet'], avoid: ['bean', 'pea'], comments: '' },
    { id: 'garlic', names: { en: 'Garlic', de: 'Knoblauch', fr: 'Ail', la: 'Allium sativum' }, synonyms: ['knoblauch', 'ail'], helps: ['tomato', 'rose'], avoid: ['bean', 'pea'], comments: 'Deters pests when planted near roses and tomatoes.' },
    { id: 'lettuce', names: { en: 'Lettuce', de: 'Salat', fr: 'Laitue', la: 'Lactuca sativa' }, synonyms: ['salat', 'laitue'], helps: ['carrot', 'radish', 'strawberry'], avoid: [], comments: '' },
    { id: 'cucumber', names: { en: 'Cucumber', de: 'Gurke', fr: 'Concombre', la: 'Cucumis sativus' }, synonyms: ['gurke', 'concombre'], helps: ['bean', 'pea', 'marigold'], avoid: ['sage'], comments: '' },
    { id: 'bean', names: { en: 'Bean', de: 'Bohne', fr: 'Haricot', la: 'Phaseolus vulgaris' }, synonyms: ['bohne', 'haricot'], helps: ['carrot', 'cucumber', 'pea'], avoid: ['onion', 'garlic'], comments: 'Fixes nitrogen in the soil.' },
    { id: 'pea', names: { en: 'Pea', de: 'Erbse', fr: 'Pois', la: 'Pisum sativum' }, synonyms: ['erbse', 'pois'], helps: ['carrot', 'radish', 'bean'], avoid: ['onion', 'garlic'], comments: 'Fixes nitrogen.' },
    { id: 'spinach', names: { en: 'Spinach', de: 'Spinat', fr: 'Épinard', la: 'Spinacia oleracea' }, synonyms: ['spinat', 'epinard'], helps: ['strawberry', 'pea'], avoid: [], comments: '' },
    { id: 'radish', names: { en: 'Radish', de: 'Radieschen', fr: 'Radis', la: 'Raphanus sativus' }, synonyms: ['radieschen', 'radis'], helps: ['lettuce', 'pea', 'cucumber'], avoid: [], comments: '' },
    { id: 'dill', names: { en: 'Dill', de: 'Dill', fr: 'Aneth', la: 'Anethum graveolens' }, synonyms: ['aneth'], helps: ['lettuce', 'cucumber'], avoid: ['carrot', 'tomato'], comments: '' },
    { id: 'sage', names: { en: 'Sage', de: 'Salbei', fr: 'Sauge', la: 'Salvia officinalis' }, synonyms: ['salbei', 'sauge'], helps: ['carrot', 'cabbage'], avoid: ['cucumber', 'basil'], comments: '' },
    { id: 'rosemary', names: { en: 'Rosemary', de: 'Rosmarin', fr: 'Romarin', la: 'Salvia rosmarinus' }, synonyms: ['rosmarin', 'romarin'], helps: ['carrot', 'bean', 'sage'], avoid: [], comments: '' },
    { id: 'nasturtium', names: { en: 'Nasturtium', de: 'Kapuzinerkresse', fr: 'Capucine', la: 'Tropaeolum majus' }, synonyms: ['kapuzinerkresse', 'capucine'], helps: ['cucumber', 'tomato', 'bean'], avoid: [], comments: 'Excellent trap crop for aphids.' },
  ],
};
