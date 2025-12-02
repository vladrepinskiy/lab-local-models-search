export type ArtHistoryDocument = {
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
  embedding?: number[];
};

export type ArtHistoryDataset = {
  generatedAt: string;
  totalArticles: number;
  failedArticles: number;
  totalDocuments: number;
  documents: ArtHistoryDocument[];
};
