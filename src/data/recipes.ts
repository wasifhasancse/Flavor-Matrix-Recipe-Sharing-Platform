export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  likes: number;
  isFeatured: boolean;
  author: string;
  prepTime: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
}

export const mockRecipes: Recipe[] = [
  {
    id: "rec-1",
    title: "Classic Spaghetti Carbonara",
    description: "An elegant Roman pasta dish made with fresh eggs, hard cheese, cured pork, and black pepper.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
    likes: 450,
    isFeatured: true,
    author: "Chef Luigi",
    prepTime: "10 mins",
    cookTime: "15 mins",
    difficulty: "Medium",
    category: "Italian",
  },
  {
    id: "rec-2",
    title: "Spicy Thai Green Curry",
    description: "A fragrant, rich coconut-based green curry loaded with fresh herbs, vegetables, and chicken.",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80",
    likes: 380,
    isFeatured: true,
    author: "Nalee Siriporn",
    prepTime: "15 mins",
    cookTime: "20 mins",
    difficulty: "Hard",
    category: "Asian",
  },
  {
    id: "rec-3",
    title: "Crispy Avocado Tacos",
    description: "Perfectly seasoned fried avocado slices served in warm corn tortillas with zesty lime crema.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    likes: 520,
    isFeatured: true,
    author: "Elena Gomez",
    prepTime: "15 mins",
    cookTime: "10 mins",
    difficulty: "Easy",
    category: "Mexican",
  },
  {
    id: "rec-4",
    title: "Decadent Chocolate Lava Cake",
    description: "Indulgent individual cakes with a rich, warm gooey liquid chocolate center.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    likes: 610,
    isFeatured: true,
    author: "Sarah Baker",
    prepTime: "10 mins",
    cookTime: "12 mins",
    difficulty: "Medium",
    category: "Desserts",
  },
  {
    id: "rec-5",
    title: "Seared Lemon Garlic Salmon",
    description: "Crispy skin-on salmon fillet seared in a butter garlic reduction with fresh lemon wedges.",
    image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=600&q=80",
    likes: 290,
    isFeatured: false,
    author: "Marcus Fisher",
    prepTime: "5 mins",
    cookTime: "15 mins",
    difficulty: "Easy",
    category: "Seafood",
  },
  {
    id: "rec-6",
    title: "Fresh Greek Mezze Salad",
    description: "Crisp cucumbers, juicy vine tomatoes, kalamata olives, and rich feta tossed in olive oil.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    likes: 180,
    isFeatured: false,
    author: "Chloe Pappas",
    prepTime: "10 mins",
    cookTime: "0 mins",
    difficulty: "Easy",
    category: "Salads",
  },
  {
    id: "rec-7",
    title: "Slow Cooked French Onion Soup",
    description: "Rich beef broth featuring deeply caramelized sweet onions topped with toasted gruyère cheese.",
    image: "https://images.unsplash.com/photo-1547592165-e1d17fed6006?auto=format&fit=crop&w=600&q=80",
    likes: 310,
    isFeatured: false,
    author: "Pierre Laurent",
    prepTime: "20 mins",
    cookTime: "1 hr",
    difficulty: "Hard",
    category: "Soups",
  },
  {
    id: "rec-8",
    title: "Japanese Matcha Roll Cake",
    description: "Fluffy green tea sponge cake rolled with fresh sweet red bean whipped cream filling.",
    image: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=600&q=80",
    likes: 240,
    isFeatured: false,
    author: "Yuki Tanaka",
    prepTime: "25 mins",
    cookTime: "20 mins",
    difficulty: "Hard",
    category: "Desserts",
  },
];
