// Array of reliable fallback images
export const FALLBACK_IMAGES = [
    'https://picsum.photos/450/600/?image=880',
    'https://picsum.photos/g/450/600/?image=473',
    'https://picsum.photos/450/600/?image=60',
    'https://picsum.photos/450/600/?image=1050',
    'https://picsum.photos/g/450/600/?image=833'
  ];
  
  // This ensures the same book always gets the same fallback image
  export const getFallbackImageForBook = (book: { id: number; title: string }): string => {
    // Use the book ID to deterministically select an image
    // If book ID isn't available, hash the title
    const seed = book.id || hashString(book.title);
    const index = seed % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
  };
  
  // Simple hash function for strings
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Function to check if a URL is one of our fallback images
  export const isFallbackImage = (url: string): boolean => {
    return FALLBACK_IMAGES.some(img => url.includes(img.split('/?')[0]));
  };