export interface Page {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface Story {
  title: string;
  pages: Page[];
}
