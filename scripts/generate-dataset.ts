import fs from 'fs/promises';
import path from 'path';

interface WikipediaArticle {
  title: string;
  content: string;
  url: string;
}

interface Document {
  title: string;
  content: string;
  sourceTitle: string;
  chunkIndex: number;
  totalChunks: number;
  metadata: {
    category: string;
    sourceUrl: string;
    wordCount: number;
  };
}

const ART_TOPICS = {
  movements: [
    'Renaissance',
    'Baroque',
    'Impressionism',
    'Cubism',
    'Surrealism',
    'Abstract Expressionism',
    'Art Nouveau',
    'Bauhaus',
    'Pop Art',
    'Minimalism',
    'Dadaism',
    'Romanticism',
    'Realism',
    'Post-Impressionism',
    'Vorticism',
    'Arte Povera',
    'Fluxus',
    'De Stijl',
    'Constructivism (art)',
    'Futurism',
    'Suprematism',
    'Orphism (art)',
    'Rayonism',
    'Neo-Dada',
    'Color Field',
    'Lyrical Abstraction',
    'Tachisme',
    'Art Informel',
    'CoBrA (avant-garde movement)',
    'Nabis (art)',
    'Symbolism (arts)',
    'Cloisonnism',
    'Synthetism',
    'Les Nabis',
    'Vienna Secession',
    'Ashcan School',
    'Regionalism (art)',
    'Precisionism',
    'Magic Realism',
    'Metaphysical painting',
    'Expressionism',
    'Fauvism',
    'Mannerism',
    'Rococo',
    'Neoclassicism',
    'Pre-Raphaelite Brotherhood',
    'Arts and Crafts movement',
    'Art Deco',
    'Nouveau réalisme',
    'Kinetic art',
    'Op art',
    'Zero (art)',
    'Situationist International',
    'Lettrism',
    'Concrete art',
    'Lyrical Abstraction',
    'Hard-edge painting',
    'Post-painterly abstraction',
    'Neo-expressionism',
    'Transavantgarde',
    'Bad Painting',
    'New Image Painting',
    'Superflat',
    'Lowbrow (art movement)',
    'Street art',
    'Graffiti',
    'Stuckism',
    'Young British Artists',
    'Relational aesthetics',
    'Post-Internet',
  ],
  artists: [
    'Leonardo da Vinci',
    'Michelangelo',
    'Rembrandt',
    'Vincent van Gogh',
    'Pablo Picasso',
    'Claude Monet',
    'Salvador Dalí',
    'Frida Kahlo',
    'Andy Warhol',
    'Johannes Vermeer',
    'Caravaggio',
    'Henri Matisse',
    'Paul Cézanne',
    'Edvard Munch',
    'Gustav Klimt',
    'Hilma af Klint',
    'Yayoi Kusama',
    'Egon Schiele',
    'Käthe Kollwitz',
    'Giorgio de Chirico',
    'Amedeo Modigliani',
    'Francis Bacon (artist)',
    'Agnes Martin',
    'Lee Krasner',
    'Helen Frankenthaler',
    'Joan Mitchell',
    'Cy Twombly',
    'Robert Rauschenberg',
    'Anselm Kiefer',
    'Gerhard Richter',
    'Lucian Freud',
    'Jean-Michel Basquiat',
    'Keith Haring',
    'Yves Klein',
    'Piero Manzoni',
    'Joseph Beuys',
    'Anish Kapoor',
    'Olafur Eliasson',
    'Kara Walker',
    'Kiki Smith',
    'Marlene Dumas',
    'Jenny Saville',
    'Dana Schutz',
    'Julie Mehretu',
    'El Anatsui',
    'Sandro Botticelli',
    'Raphael',
    'Titian',
    'Diego Velázquez',
    'Peter Paul Rubens',
    'Jan van Eyck',
    'Hieronymus Bosch',
    'Pieter Bruegel the Elder',
    'El Greco',
    'Artemisia Gentileschi',
    'Jacques-Louis David',
    'Francisco Goya',
    'J. M. W. Turner',
    'Caspar David Friedrich',
    'Eugène Delacroix',
    'Gustave Courbet',
    'Édouard Manet',
    'Edgar Degas',
    'Pierre-Auguste Renoir',
    'Camille Pissarro',
    'Paul Gauguin',
    'Georges Seurat',
    'Toulouse-Lautrec',
    'Wassily Kandinsky',
    'Piet Mondrian',
    'Kazimir Malevich',
    'Paul Klee',
    'Marc Chagall',
    'Max Ernst',
    'Joan Miró',
    'René Magritte',
    'Diego Rivera',
    'Jackson Pollock',
    'Mark Rothko',
    'Willem de Kooning',
    'Franz Kline',
    'Barnett Newman',
    'Clyfford Still',
    'Robert Motherwell',
    'Jasper Johns',
    'Roy Lichtenstein',
    'David Hockney',
    'Lucio Fontana',
    'Alberto Giacometti',
    'Louise Bourgeois',
    'Eva Hesse',
    'Sol LeWitt',
    'Donald Judd',
    'Dan Flavin',
    'Bruce Nauman',
    'Richard Serra',
    'Cindy Sherman',
    'Barbara Kruger',
    'Jeff Koons',
    'Damien Hirst',
    'Tracey Emin',
    'Takashi Murakami',
    'Ai Weiwei',
    'Banksy',
    'Kehinde Wiley',
    'Amy Sherald',
    'Njideka Akunyili Crosby',
  ],
  techniques: [
    'Oil painting',
    'Watercolor painting',
    'Sculpture',
    'Fresco',
    'Printmaking',
    'Photography',
    'Installation art',
    'Digital art',
    'Etching',
    'Lithography',
    'Encaustic painting',
    'Grisaille',
    'Sgraffito',
    'Impasto',
    'Glazing (painting technique)',
    'Scumbling',
    'Sfumato',
    'Tenebrism',
    "Trompe-l'œil",
    'Assemblage (art)',
    'Collage',
    'Decalcomania',
    'Frottage (art)',
    'Grattage',
    'Action painting',
    'Pointillism',
    'Divisionism',
    'Monotype (printmaking)',
    'Aquatint',
    'Mezzotint',
    'Woodcut',
    'Screen printing',
    'Cyanotype',
    'Gum bichromate',
    'Photogravure',
    'Acrylic paint',
    'Gouache',
    'Tempera',
    'Ink wash painting',
    'Pastel',
    'Chalk',
    'Charcoal',
    'Drawing',
    'Mosaic',
    'Stained glass',
    'Tapestry',
    'Ceramic art',
    'Pottery',
    'Glassblowing',
    'Metalworking',
    'Casting (metalworking)',
    'Welding',
    'Found object',
    'Mixed media',
    'Photomontage',
    'Video art',
    'Sound art',
    'Light art',
    'Kinetic sculpture',
    'Mobile (sculpture)',
    'Relief',
    'Intaglio (printmaking)',
    'Linocut',
    'Drypoint',
    'Engraving',
    'Monoprint',
    'Serigraphy',
    'Risograph',
    'Daguerreotype',
    'Calotype',
    'Gelatin silver process',
    'Chromogenic print',
    'Platinum print',
  ],
  museums: [
    'Louvre',
    'Metropolitan Museum of Art',
    'Uffizi',
    'Prado Museum',
    'British Museum',
    'Rijksmuseum',
    'Hermitage Museum',
    'Tate Modern',
    'MoMA',
    'Guggenheim Museum',
    'Centre Pompidou',
    "Musée d'Orsay",
    'Van Gogh Museum',
    'Neue Nationalgalerie',
    'Stedelijk Museum Amsterdam',
    'Louisiana Museum of Modern Art',
    'Fondation Beyeler',
    'Kunstmuseum Basel',
    'Museo Nacional Centro de Arte Reina Sofía',
    'MAXXI',
    'Berlinische Galerie',
    'Museum Ludwig',
    'Tate Britain',
    'National Gallery',
    'National Gallery of Art',
    'Art Institute of Chicago',
    'Getty Center',
    'Whitney Museum of American Art',
    'Smithsonian American Art Museum',
    'Philadelphia Museum of Art',
    'Museum of Fine Arts, Boston',
    'Musée Rodin',
    'Musée Picasso',
    'Musée Marmottan Monet',
    'Albertina',
    'Belvedere (palace)',
    'Kunsthistorisches Museum',
    'Galleria Borghese',
    'Palazzo Pitti',
    'Peggy Guggenheim Collection',
    "Ca' Pesaro",
    'Museo del Prado',
    'Thyssen-Bornemisza Museum',
    'Museo Sorolla',
    'Moderna Museet',
  ],
  concepts: [
    'Color theory',
    'Perspective (graphical)',
    'Chiaroscuro',
    'Composition (visual arts)',
    'Art history',
    'Aesthetics',
    'Iconography',
    'Patronage',
    'Sfumato',
    'Contrapposto',
    'Golden ratio',
    'Rule of thirds',
    'Negative space',
    'Pictorial space',
    'Atmospheric perspective',
    'Foreshortening',
    'Art criticism',
    'Semiotics',
    'Visual culture',
    'Mimesis',
    'Ekphrasis',
    'Ut pictura poesis',
    'Paragone',
    'Gesamtkunstwerk',
    'Appropriation (art)',
    'Readymade',
    'Site-specific art',
    'Process art',
    'Performance art',
    'Happenings',
    'Land art',
    'Conceptual art',
    'Arte Povera',
    'Form (visual arts)',
    'Line (art)',
    'Shape',
    'Space (art)',
    'Texture (visual arts)',
    'Value (visual arts)',
    'Symmetry',
    'Asymmetry',
    'Balance (visual composition)',
    'Harmony (visual composition)',
    'Rhythm (visual arts)',
    'Proportion (architecture)',
    'Scale (art)',
    'Unity (art)',
    'Variety (art)',
    'Emphasis (visual arts)',
    'Movement (visual arts)',
    'Pattern',
    'Repetition (art)',
    'Art market',
    'Art auction',
    'Art dealer',
    'Art collector',
    'Art conservation',
    'Art restoration',
    'Museum studies',
    'Curating',
    'Art exhibition',
    'Biennale',
    'Art fair',
    'Artistic freedom',
    'Censorship of images',
    'Cultural appropriation in the arts',
    'Outsider art',
    'Folk art',
    'Naive art',
    'Primitivism',
    'Orientalism',
    'Exoticism',
    'Sublime (philosophy)',
    'Grotesque',
    'Kitsch',
    'Camp (style)',
  ],
  periods: [
    'Prehistoric art',
    'Ancient Egyptian art',
    'Ancient Greek art',
    'Ancient Roman art',
    'Byzantine art',
    'Medieval art',
    'Romanesque art',
    'Gothic art',
    'Early Netherlandish painting',
    'Italian Renaissance',
    'High Renaissance',
    'Northern Renaissance',
    'Venetian painting',
    'Dutch Golden Age painting',
    'Spanish Golden Age',
    'Baroque painting',
    'Rococo',
    'Neoclassicism',
    'Romanticism',
    'Academic art',
    'Victorian painting',
    'Modern art',
    'Contemporary art',
    'Western painting',
    'Eastern art history',
    'Islamic art',
    'African art',
    'Pre-Columbian art',
  ],
  artworks: [
    'Mona Lisa',
    'The Last Supper (Leonardo)',
    'Sistine Chapel ceiling',
    'The Creation of Adam',
    'David (Michelangelo)',
    'The Birth of Venus',
    'Primavera (Botticelli)',
    'The School of Athens',
    'The Night Watch',
    'Girl with a Pearl Earring',
    'The Art of Painting',
    'Las Meninas',
    'The Third of May 1808',
    'Saturn Devouring His Son',
    'The Fighting Temeraire',
    'The Hay Wain',
    'Liberty Leading the People',
    'The Death of Marat',
    'Olympia (Manet)',
    "Le Déjeuner sur l'herbe",
    'A Bar at the Folies-Bergère',
    'The Starry Night',
    'Sunflowers (Van Gogh)',
    'The Potato Eaters',
    'Bedroom in Arles',
    'Café Terrace at Night',
    "Les Demoiselles d'Avignon",
    'Guernica (Picasso)',
    'The Weeping Woman',
    'The Persistence of Memory',
    'The Son of Man',
    'The Treachery of Images',
    'American Gothic',
    'Nighthawks (Hopper)',
    "Christina's World",
    'No. 5, 1948',
    'Autumn Rhythm',
    'Blue Poles',
    "Campbell's Soup Cans",
    'Marilyn Diptych',
  ],
};

/**
 * Fetch a Wikipedia article
 */
const fetchWikipediaArticle = async (
  title: string
): Promise<WikipediaArticle | null> => {
  try {
    const url =
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&format=json&origin=*&prop=extracts` +
      `&titles=${encodeURIComponent(title)}&explaintext=1&exsectionformat=plain`;

    const response = await fetch(url);
    const data = await response.json();
    const page = Object.values(data.query.pages)[0] as any;

    if (page.missing) return null;

    return {
      title: page.title,
      content: page.extract || '',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    };
  } catch (error) {
    console.error(`Failed to fetch ${title}:`, error);
    return null;
  }
};

/**
 * Chunk text into smaller pieces (max 500 words per chunk)
 */
const chunkText = (text: string, maxWords: number = 500): string[] => {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + sentence;
    const wordCount = potentialChunk.split(/\s+/).length;

    if (wordCount > maxWords && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
};

/**
 * Convert article to chunked documents
 */
const articleToDocuments = (
  article: WikipediaArticle,
  category: string
): Document[] => {
  const chunks = chunkText(article.content, 500);

  return chunks.map((chunk, index) => ({
    title:
      chunks.length > 1
        ? `${article.title} (Part ${index + 1}/${chunks.length})`
        : article.title,
    content: chunk,
    sourceTitle: article.title,
    chunkIndex: index,
    totalChunks: chunks.length,
    metadata: {
      category,
      sourceUrl: article.url,
      wordCount: chunk.split(/\s+/).length,
    },
  }));
};

/**
 * Main generation function
 */
const generateDataset = async () => {
  console.log('🎨 Fetching art history articles from Wikipedia...\n');

  const allDocuments: Document[] = [];
  let totalArticles = 0;
  let failedArticles = 0;

  // Fetch all categories
  for (const [category, topics] of Object.entries(ART_TOPICS)) {
    console.log(`📚 Fetching ${category}...`);

    for (const topic of topics) {
      const article = await fetchWikipediaArticle(topic);

      if (article && article.content) {
        const documents = articleToDocuments(article, category);
        allDocuments.push(...documents);
        totalArticles++;
        console.log(`  ✓ ${topic} (${documents.length} chunks)`);
      } else {
        failedArticles++;
        console.log(`  ✗ ${topic} (not found or empty)`);
      }

      // Be nice to Wikipedia's servers - 100ms delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log();
  }

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  // Save to JSON file
  const output = {
    generatedAt: new Date().toISOString(),
    totalArticles,
    failedArticles,
    totalDocuments: allDocuments.length,
    documents: allDocuments,
  };

  const outputPath = path.join(dataDir, 'art-history-dataset.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

  console.log('✅ Dataset generated!');
  console.log(`   Articles fetched: ${totalArticles}`);
  console.log(`   Failed: ${failedArticles}`);
  console.log(`   Total documents (with chunks): ${allDocuments.length}`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(
    '\n💡 You can now use "Seed DB" button in the app to load this data!'
  );
};

generateDataset().catch(console.error);
