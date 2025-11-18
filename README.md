# URLogViz - Universal Robot Log Visualization

URLogViz is a comprehensive web application designed for visualizing and analyzing Universal Robot (UR) log files. It provides real-time analytics, detailed visualizations, and monitoring capabilities for robot operations.

## Features

- **Log File Upload and Processing**: Upload and parse UR robot log files for comprehensive analysis
- **Real-time Analytics Dashboard**: Monitor key robot performance metrics including following error, motor current, temperature, and TCP forces
- **Interactive Visualizations**: Multiple chart types to visualize robot behavior over time
- **Anomaly Detection**: Automatic detection and logging of unusual events and potential issues
- **Multi-tab Analysis**: Organized analysis sections for kinematics, dynamics, electrical, and diagnostic data
- **Supabase Integration**: Secure cloud storage and real-time data synchronization
- **Responsive Design**: Optimized for both desktop and mobile viewing

## Technologies Used

- **Next.js 14**: React framework with App Router for modern web development
- **TypeScript**: Type-safe development for enhanced code quality
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: Component library for consistent UI elements
- **Supabase**: Backend services including authentication, database, and storage
- **Recharts**: Interactive charting library for data visualization
- **Lucide React**: Icon library for clean, consistent icons

## Architecture

The application is built with a modern, scalable architecture:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, and Edge Functions)
- **Analytics**: Custom data processing and visualization components
- **Real-time**: Live data updates and analytics

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd URLogViz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your Supabase configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Log File**: Navigate to the upload page and upload a Universal Robot log file
2. **View Dashboard**: Access key metrics and KPIs on the dashboard page
3. **Detailed Analysis**: Explore detailed data visualizations on the analysis page
4. **Monitor Performance**: Track robot performance metrics across multiple tabs

## Key Components

- **Dashboard**: Overview of key performance indicators
- **Analysis Suite**: Detailed visualizations with four categories:
  - Kinematics (Movement)
  - Dynamics (Forces)
  - Electrical (Power)
  - Diagnostics (Health)

## API Integration

The application uses Supabase for backend services:
- Authentication
- Database storage for analysis results
- Edge Functions for log processing
- Real-time updates

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For questions, issues, or feature requests, please open an issue in the repository or contact the development team.