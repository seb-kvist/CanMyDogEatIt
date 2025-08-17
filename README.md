# Can My Dog Eat It?

A comprehensive web application to help dog owners quickly check if foods, drinks, or household items are safe for their dogs. Get instant safety verdicts with detailed information about preparation, portions, and symptoms to watch for.

## Features

- **Quick Food Safety Check**: Search for any food item and get instant safety verdicts
- **Comprehensive Database**: Extensive database of foods with detailed safety information
- **Veterinary-Sourced Information**: Reliable information backed by veterinary research
- **Preparation Guides**: Detailed instructions on how to safely prepare foods for dogs
- **Portion Recommendations**: Guidelines on appropriate serving sizes
- **Symptom Monitoring**: Information about what symptoms to watch for

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <YOUR_REPOSITORY_URL>
cd CanMyDogEatIt
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # shadcn-ui components
│   └── VerdictCard.tsx
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
└── main.tsx       # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application provides general information about dog food safety. Always consult with a veterinarian for specific advice about your dog's diet and health. The information provided is not a substitute for professional veterinary care.
