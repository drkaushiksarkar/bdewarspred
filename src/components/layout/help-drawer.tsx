'use client';

import * as React from 'react';
import { HelpCircle, FileText, BarChart2, Map, Users, Settings, Database, Filter, Download, MousePointerClick, AreaChart, MapPin, Folder, Server, Search, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '../ui/scroll-area';

export default function HelpDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Help / Setup">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[520px] sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Help & Developer Guide</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <Tabs defaultValue="developer">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">User Guide</TabsTrigger>
              <TabsTrigger value="developer">Developer Guide</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100vh-10rem)]">
            <TabsContent value="setup" className="p-1">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Welcome to EWARS Bangladesh. This guide provides a step-by-step walkthrough of the dashboard's features to help you monitor disease dynamics effectively.
                </p>

                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <Filter className="mr-2" />
                      Step 1: Using Dashboard Filters
                    </AccordionTrigger>
                    <AccordionContent>
                      <p>
                        The sidebar on the left contains filters that allow you to customize the data displayed on the dashboard. All charts and maps will dynamically update based on your selections.
                      </p>
                      <ol className="list-decimal pl-5">
                        <li>
                          <strong>Select a Location:</strong>
                          <ul className="list-disc pl-5">
                              <li><strong>Division:</strong> Start by choosing a top-level administrative area (e.g., "Dhaka"). This is the primary location filter.</li>
                              <li><strong>District:</strong> After selecting a division, you can optionally refine your view by choosing a specific district within it (e.g., "Dhaka North"). If no district is selected, the data will be aggregated for the entire division.</li>
                          </ul>
                        </li>
                        <li>
                          <strong>Select a Disease:</strong>
                           <ul className="list-disc pl-5">
                              <li>Choose from the available diseases in the dropdown (e.g., "Dengue," "Influenza"). The entire dashboard will update to show data relevant to the selected disease.</li>
                          </ul>
                        </li>
                        <li>
                          <strong>Select a Date Range:</strong>
                          <ul className="list-disc pl-5">
                              <li>Click the date field to open a calendar.</li>
                              <li>Select a start date and an end date to define the time period for the "Disease Case Trends" chart. You can navigate between months using the arrows.</li>
                          </ul>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <Search className="mr-2" />
                       Step 2: Using the AI Search
                    </AccordionTrigger>
                    <AccordionContent>
                      <p>
                        The search bar in the header is a powerful AI assistant. You can ask it questions in natural language to get quick insights from the dashboard data.
                      </p>
                      <ol className="list-decimal pl-5">
                          <li>
                            <strong>Ask a Question:</strong>
                            <ul className="list-disc pl-5">
                                <li>Click on the search bar at the top of the page.</li>
                                <li>Type your question. For example, you could ask:
                                    <ul>
                                        <li><em>"Which location has the highest risk score?"</em></li>
                                        <li><em>"What are the top 3 most important features for predictions?"</em></li>
                                        <li><em>"What is the incidence rate in Alpha district?"</em></li>
                                    </ul>
                                </li>
                            </ul>
                          </li>
                          <li>
                            <strong>Get an Answer:</strong>
                             <ul className="list-disc pl-5">
                                <li>Press Enter. A dialog box will appear while the AI analyzes the data.</li>
                                <li>The AI will provide a direct, text-based answer to your question based on the currently displayed data (Risk Heatmap, Feature Importance, etc.).</li>
                            </ul>
                          </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      <BarChart2 className="mr-2" />
                      Step 3: Interpreting the Visualizations
                    </AccordionTrigger>
                    <AccordionContent>
                       <p>The main grid consists of several interactive cards. Here’s how to read them:</p>
                        <ol className="list-decimal pl-5">
                            <li><strong>Weather Panels:</strong> At the top, these show current key weather indicators like Temperature, Humidity, and Rainfall. If a value is red, it indicates an extreme weather condition that could elevate disease risk.</li>
                            <li>
                                <strong><AreaChart className="inline-block h-4 w-4 mr-1" />Disease Case Trends:</strong>
                                <ul className="list-disc pl-5">
                                    <li><strong>Actual Cases (Purple Area):</strong> This shows the number of reported cases.</li>
                                    <li><strong>Predicted Cases (Orange Line):</strong> This is the model's forecast for case counts.</li>
                                    <li><strong>Prediction Uncertainty (Light Orange Shaded Area):</strong> This band represents the confidence interval of our prediction. A wider band means more uncertainty.</li>
                                    <li><strong>Zoom & Pan:</strong> Use the brush tool at the bottom of the chart to click and drag to zoom into a specific time period.</li>
                                </ul>
                            </li>
                            <li>
                                <strong><MousePointerClick className="inline-block h-4 w-4 mr-1" />Feature Importance:</strong>
                                <ul className="list-disc pl-5">
                                    <li>This chart shows which factors are most influential in the model's predictions.</li>
                                    <li><strong>Positive Bars (Purple):</strong> Factors that increase the predicted number of cases (e.g., `Rainfall (14d lag)`).</li>
                                    <li><strong>Negative Bars (Orange):</strong> Factors that decrease the predicted number of cases (e.g., `Govt. Interventions`).</li>
                                </ul>
                            </li>
                            <li>
                                <strong><Map className="inline-block h-4 w-4 mr-1" />Disease Incidence Map:</strong>
                                <ul className="list-disc pl-5">
                                    <li>This map of Genland shows disease incidence by district.</li>
                                    <li><strong>Hover:</strong> Move your mouse over a district to see its name.</li>
                                    <li><strong>Click:</strong> Click a district to select it and see its exact incidence rate displayed in the card's description. The selected district will be highlighted with a border.</li>
                                    <li><strong>Color Legend:</strong> Red = High Incidence, Orange = Medium Incidence, Purple = Low Incidence.</li>
                                </ul>
                            </li>
                             <li>
                                <strong><MapPin className="inline-block h-4 w-4 mr-1" />Non-Spatial Risk Heatmap:</strong>
                                <ul className="list-disc pl-5">
                                    <li>This table ranks specific, named locations (not tied to the map) by their risk score.</li>
                                     <li><strong>Sorting:</strong> Click on the headers ("Risk Level," "Score," "Change") to sort the table and identify the highest-risk areas or those with the most significant recent change.</li>
                                </ul>
                            </li>
                        </ol>
                    </AccordionContent>
                  </AccordionItem>
                    <AccordionItem value="item-4">
                    <AccordionTrigger>
                      <Download className="mr-2" />
                      Step 4: Generating a Report
                    </AccordionTrigger>
                    <AccordionContent>
                      <p>
                        You can download a summary report based on your current filter settings.
                      </p>
                      <ol className="list-decimal pl-5">
                          <li>First, set your desired <strong>Location</strong>, <strong>Disease</strong>, and <strong>Date Range</strong> filters as described in Step 1.</li>
                          <li>Click the <strong>"Download Report"</strong> button at the bottom of the sidebar.</li>
                          <li>Our GenAI assistant will generate a report in CSV or PDF format based on your selections. A "Save As" dialog will appear in your browser, allowing you to download the file.</li>
                          <li>Note: The report generation is powered by AI and may take a few moments.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="developer" className="p-1">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  This guide provides a technical overview of the application's architecture and instructions for deploying it to an external server.
                </p>

                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <Folder className="mr-2" />
                      Phase 1: Application Architecture Guide
                    </AccordionTrigger>
                    <AccordionContent>
                        <h5>Project Structure Overview</h5>
                        <p>This is a <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">Next.js</a> application built with the App Router, <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a>, and <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a>. Styling is handled by <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">Tailwind CSS</a> and <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">shadcn/ui</a> components. The backend AI capabilities are powered by <a href="https://firebase.google.com/docs/genkit" target="_blank" rel="noopener noreferrer">Genkit</a>.</p>
                         <ul className="list-disc pl-5">
                            <li><strong><code>src/app/</code></strong>: Core application routing and pages. <code>page.tsx</code> is the main entry point for the dashboard UI. <code>layout.tsx</code> is the root layout. <code>actions.ts</code> contains Server Actions for interacting with the backend.</li>
                            <li><strong><code>src/components/</code></strong>: Contains all React components.
                                <ul className="list-disc pl-5">
                                    <li><code>dashboard/</code>: High-level widgets for the dashboard grid (e.g., <code>TimeSeriesChart</code>, <code>ChoroplethMap</code>).</li>
                                    <li><code>filters/</code>: Components used in the sidebar for data filtering.</li>
                                    <li><code>layout/</code>: Structural components like the <code>Header</code>, <code>AppSidebar</code>, and this <code>HelpDrawer</code>.</li>
                                    <li><code>ui/</code>: Base UI components from shadcn/ui (Button, Card, etc.).</li>
                                </ul>
                            </li>
                            <li><strong><code>src/lib/</code></strong>: Shared utilities, data, and type definitions.
                                <ul className="list-disc pl-5">
                                    <li><code>data.ts</code>: Currently holds mock data for the dashboard. In a production setup, this would be replaced with API calls to a real database.</li>
                                    <li><code>types.ts</code>: TypeScript interfaces for our data models (<code>Location</code>, <code>Disease</code>, etc.).</li>
                                    <li><code>utils.ts</code>: Utility functions, including the <code>cn</code> helper for merging Tailwind classes.</li>
                                </ul>
                            </li>
                            <li><strong><code>src/ai/</code></strong>: Contains all Genkit-related code for generative AI features.
                                <ul className="list-disc pl-5">
                                    <li><code>genkit.ts</code>: Initializes and configures the core Genkit AI instance.</li>
                                    <li><code>flows/</code>: Defines the multi-step AI workflows. <code>generate-report-from-prompt.ts</code> orchestrates the LLM call for report generation. <code>data-qa.ts</code> powers the natural language search.</li>
                                </ul>
                            </li>
                            <li><strong><code>public/</code></strong>: Static assets, which are publicly accessible.</li>
                             <li><strong><code>next.config.ts</code></strong>: Configuration file for the Next.js application.</li>
                             <li><strong><code>package.json</code></strong>: Defines project dependencies and scripts.</li>
                        </ul>
                        
                        <h5><Bot className="inline-block h-4 w-4 mr-1" />AI Search Feature Architecture</h5>
                        <p>The AI-powered search is implemented using a combination of a React client component, a Next.js Server Action, and a Genkit flow.</p>
                        <ol className="list-decimal pl-5">
                           <li><strong>Client Component (<code>src/components/layout/header.tsx</code>):</strong> The search input in the header captures the user's question. On submission, it calls a Server Action.</li>
                           <li><strong>Server Action (<code>src/app/actions.ts</code>):</strong> The <code>searchAction</code> function receives the question. It compiles a "context" string containing a description and a JSON sample of the dashboard's mock data.</li>
                           <li><strong>Genkit Flow (<code>src/ai/flows/data-qa.ts</code>):</strong> The Server Action passes the question and the data context to the <code>answerQuestion</code> flow. This Genkit flow uses a prompt to instruct the language model to act as a data analyst and answer the question based on the provided context.</li>
                           <li><strong>Response:</strong> The answer is passed back through the Server Action to the client, where it is displayed in a dialog box. This architecture ensures that all Genkit code and API keys remain securely on the server.</li>
                        </ol>

                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <Server className="mr-2" />
                      Phase 2: Server Deployment Guide
                    </AccordionTrigger>
                    <AccordionContent>
                      <h5>Step 2.1: Build the Application</h5>
                      <p>Before deployment, you need to create a production-ready build of the application. This process compiles the TypeScript/React code into optimized static HTML, CSS, and JavaScript files.</p>
                      
                      <h6>Prerequisites</h6>
                      <p>Ensure you have <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a> (version 20.x or later) and a package manager like <a href="https://www.npmjs.com/" target="_blank" rel="noopener noreferrer">npm</a> installed on your local machine.</p>

                      <h6>Step 1: Install Dependencies</h6>
                      <p>Open a terminal in the project's root directory. If this is the first time building or if dependencies have changed, run:</p>
                      <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>npm install</code></pre>
                      <p>This command reads the <code>package.json</code> and <code>package-lock.json</code> files and downloads the exact versions of all required libraries into the <code>node_modules</code> directory.</p>
                      
                      <h6>Key Dependencies Overview</h6>
                      <p>This command installs all the necessary libraries defined in <code>package.json</code>. Here is a brief overview of the core technologies used in this application:</p>
                      <ul className="list-disc pl-5">
                        <li><strong>Core Framework:</strong>
                            <ul>
                                <li><strong>Next.js (<code>next</code>):</strong> A React framework for building production-grade web applications with features like server-side rendering and static site generation.</li>
                                <li><strong>React (<code>react</code>, <code>react-dom</code>):</strong> A JavaScript library for building user interfaces with a component-based architecture.</li>
                                <li><strong>TypeScript (<code>typescript</code>):</strong> A superset of JavaScript that adds static types, improving code quality and developer experience.</li>
                            </ul>
                        </li>
                        <li><strong>Generative AI:</strong>
                            <ul>
                                <li><strong>Genkit (<code>genkit</code>, <code>@genkit-ai/googleai</code>):</strong> A framework for building robust, production-ready AI-powered features. It orchestrates calls to large language models (LLMs).</li>
                                <li><strong>Zod (<code>zod</code>):</strong> A TypeScript-first schema declaration and validation library, used here to define the input and output structures for AI flows.</li>
                            </ul>
                        </li>
                        <li><strong>UI & Styling:</strong>
                            <ul>
                                <li><strong>Tailwind CSS (<code>tailwindcss</code>):</strong> A utility-first CSS framework for rapidly building custom designs without writing traditional CSS.</li>
                                <li><strong>shadcn/ui (<code>@radix-ui/*</code>, <code>lucide-react</code>, etc.):</strong> A collection of beautifully designed, accessible, and reusable components built on top of Radix UI and Tailwind CSS.</li>
                                <li><strong>Recharts (<code>recharts</code>):</strong> A composable charting library built on React components, used for all the data visualizations on the dashboard.</li>
                            </ul>
                        </li>
                        <li><strong>Utilities:</strong>
                             <ul>
                                <li><strong>Date FNS (<code>date-fns</code>):</strong> A modern JavaScript date utility library used for formatting and manipulating dates in the filters and charts.</li>
                            </ul>
                        </li>
                      </ul>

                      <h6>Step 2: Run the Production Build Command</h6>
                      <p>Execute the build script defined in <code>package.json</code>:</p>
                      <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>npm run build</code></pre>
                      <p>This command triggers the Next.js build process. Here’s what it does:</p>
                      <ul className="list-disc pl-5">
                        <li><strong>Code Compilation:</strong> It transpiles your TypeScript (.ts, .tsx) files into JavaScript that browsers can understand.</li>
                        <li><strong>Code Bundling:</strong> It groups your application's JavaScript code and its dependencies into a few optimized files ("bundles" or "chunks").</li>
                        <li><strong>Code Minification:</strong> It removes all unnecessary characters (like spaces, newlines, and comments) from the code to make the files smaller for faster downloads.</li>
                        <li><strong>Static Site Generation (SSG):</strong> For pages that don't need real-time data, Next.js pre-renders them into static HTML files at build time.</li>
                        <li><strong>Server-Side Rendering (SSR) Functions:</strong> For pages that use Server Components or fetch data on each request, Next.js creates optimized server-side functions.</li>
                        <li><strong>CSS Optimization:</strong> It processes your Tailwind CSS classes, removes any unused styles (purging), and creates highly optimized, small CSS files.</li>
                      </ul>

                      <h6>Step 3: Verify the Build Output</h6>
                      <p>Once the command finishes (it may take a minute or two), a new directory named <code>.next</code> will be created in your project root. This is your production build artifact. It contains everything needed to run your application in a production environment.</p>
                      <p>You should see output in your terminal summarizing the build, including page sizes and chunk details. A successful build will end without any errors.</p>
                      <p><strong>Crucially, you only need to deploy the <code>.next</code> directory, along with <code>package.json</code>, <code>public/</code>, and your <code>node_modules</code> to the server. You do not need to deploy the entire <code>src</code> directory or other development files.</strong></p>

                      <h6>Troubleshooting Common Build Errors</h6>
                      <ul className="list-disc pl-5">
                          <li><strong>Type Errors:</strong> If the build fails with TypeScript errors, run <code>npm run typecheck</code> to see them clearly. Fix any type mismatches in your code before attempting to build again.</li>
                          <li><strong>Module Not Found:</strong> This usually means a dependency is missing. Try deleting the <code>node_modules</code> directory and the <code>package-lock.json</code> file, then run <code>npm install</code> again.</li>
                          <li><strong>Configuration Errors:</strong> Errors in <code>next.config.ts</code> or <code>tailwind.config.ts</code> can cause the build to fail. Check the terminal output for clues pointing to these files.</li>
                      </ul>

                      <h5>Step 2.2: Prepare the Server Environment</h5>
                      <p>The application runs on <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a>. Your server (whether it's a cloud VM like an EC2 instance, or an on-premise server like Matrox) must have Node.js installed.</p>
                       <ol className="list-decimal pl-5">
                           <li>Install a recent LTS version of Node.js (e.g., 20.x or later) on your server.</li>
                           <li>You will also need a process manager like <a href="https://pm2.keymetrics.io/" target="_blank" rel="noopener noreferrer">PM2</a> to keep the application running continuously and manage logs. Install it globally: <code>npm install -g pm2</code>.</li>
                           <li>Set up environment variables. Create a <code>.env.local</code> file in the root of your project directory on the server. This is where you'll put secrets like your <code>GEMINI_API_KEY</code>. This file is git-ignored and should never be committed to source control.</li>
                       </ol>

                      <h5>Step 2.3: Deploy and Run the Application</h5>
                      <p>Transfer your project files to the server and start the application.</p>
                       <ol className="list-decimal pl-5">
                           <li>Copy the entire project folder (including the <code>.next</code> directory, <code>public</code>, and <code>package.json</code>) to your server using a tool like <code>scp</code> or <code>rsync</code>.</li>
                           <li>On the server, navigate to the project directory and install only the production dependencies: <code>npm install --omit=dev</code>.</li>
                           <li>Use PM2 to start the Next.js application: <code>pm2 start npm --name "ewars-bangladesh" -- run start</code>. The <code>-- run start</code> part tells PM2 to execute the "start" script defined in your <code>package.json</code>.</li>
                           <li>Your application is now running. By default, it listens on port 9002 (as configured in `package.json`).</li>
                       </ol>

                        <h5>Step 2.4 (Optional): Configure a Reverse Proxy (e.g., Nginx)</h5>
                        <p>To serve your application on standard ports (like 80 for HTTP or 443 for HTTPS) and to handle SSL, you should use a reverse proxy like Nginx.</p>
                         <ol className="list-decimal pl-5">
                             <li>Install Nginx on your server.</li>
                             <li>Create a new Nginx site configuration file (e.g., in <code>/etc/nginx/sites-available/ewars-bangladesh</code>).</li>
                             <li>Add a server block to proxy requests to your running Node.js application:
                                 <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`}</code></pre>
                             </li>
                             <li>Enable the site and restart Nginx. Now, traffic to <code>your_domain.com</code> will be securely routed to your application.</li>
                         </ol>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3">
                    <AccordionTrigger>
                      <Database className="mr-2" />
                      Phase 3: Connecting a Production Data Pipeline
                    </AccordionTrigger>
                    <AccordionContent>
                        <h5>Overview</h5>
                        <p>This application is currently powered by mock data located in <code>src/lib/data.ts</code>. To transition to a production environment, you will need to replace this static data with a live connection to a database. This guide outlines the steps to connect to a PostgreSQL database, but the principles apply to other SQL databases as well.</p>
                        
                        <h5>Step 3.1: Define the Database Schema</h5>
                        <p>First, you need to create tables in your PostgreSQL database that mirror the data structures defined in <code>src/lib/types.ts</code>. Below are some example <code>CREATE TABLE</code> statements to get you started. You should adapt these to your specific needs, such as adding indexes for performance.</p>

                        <h6>Locations Table</h6>
                        <p>Stores the hierarchical location data used by the location filter.</p>
                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,
    parent_id VARCHAR(50) REFERENCES locations(id)
);`}</code></pre>

                        <h6>Diseases Table</h6>
                        <p>Stores the list of diseases for the disease filter.</p>
                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`CREATE TABLE diseases (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);`}</code></pre>

                        <h6>Cases Data Table</h6>
                        <p>This is the core table for time-series data, storing actual and predicted case counts for a specific disease and location on a given date.</p>
                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`CREATE TABLE daily_cases (
    record_date DATE NOT NULL,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(id),
    disease_id VARCHAR(50) NOT NULL REFERENCES diseases(id),
    actual_cases INT,
    predicted_cases INT,
    uncertainty_low INT,
    uncertainty_high INT,
    is_outbreak BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (record_date, location_id, disease_id)
);`}</code></pre>

                        <h6>Weather Data Table</h6>
                        <p>Stores daily weather readings for different locations.</p>
                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`CREATE TABLE weather_readings (
    reading_date DATE NOT NULL,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(id),
    temperature_celsius DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    rainfall_mm DECIMAL(5, 2),
    PRIMARY KEY (reading_date, location_id)
);`}</code></pre>

                        <h5>Step 3.2: Create a Data Service Layer</h5>
                        <p>Instead of importing from <code>src/lib/data.ts</code>, you'll create a new set of functions to query your database. It's best practice to centralize your database logic.</p>
                        
                        <ol className="list-decimal pl-5">
                          <li>Install a PostgreSQL client for Node.js, like <code>pg</code>: <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>npm install pg</code></pre></li>
                          <li>Create a new file, e.g., <code>src/lib/db.ts</code>, to handle the database connection and queries.</li>
                          <li>Add your database connection string to the <code>.env.local</code> file you created in Phase 2:
                          <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>DATABASE_URL="postgresql://user:password@host:port/database"</code></pre>
                          </li>
                          <li>In <code>src/lib/db.ts</code>, you would write functions to fetch data. For example:
                          <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`import { Pool } from 'pg';
import type { TimeSeriesDataPoint } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchTimeSeriesData(locationId: string, diseaseId: string, from: Date, to: Date): Promise<TimeSeriesDataPoint[]> {
  const query = \`
    SELECT 
      to_char(record_date, 'YYYY-MM-DD') as date,
      actual_cases as actual,
      predicted_cases as predicted,
      array[uncertainty_low, uncertainty_high] as uncertainty,
      is_outbreak
    FROM daily_cases
    WHERE location_id = $1 AND disease_id = $2 AND record_date BETWEEN $3 AND $4
    ORDER BY record_date ASC;
  \`;
  const res = await pool.query(query, [locationId, diseaseId, from, to]);
  return res.rows;
}
// ... create similar functions for locations, diseases, etc.`}</code></pre>
                          </li>
                        </ol>

                        <h5>Step 3.3: Update UI Components</h5>
                        <p>Finally, update the components in <code>src/components/dashboard/</code> to use your new data fetching functions. Since the dashboard components are Server Components (or used within them), you can make them `async` and `await` the data directly.</p>
                        
                        <p>For example, in <code>src/components/dashboard/dashboard-grid.tsx</code>, you would replace the static data generation:</p>
                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code>{`// Before (in dashboard-grid.tsx)
import { generateTimeSeriesData } from '@/lib/data';
// ...
const timeSeriesData = generateTimeSeriesData(60);
return (
  <TimeSeriesChart data={timeSeriesData} />
);

// After (in an async component)
import { fetchTimeSeriesData } from '@/lib/db';
// ...
export default async function DashboardGrid() {
  const searchParams = useSearchParams();
  // ... get filters
  const timeSeriesData = await fetchTimeSeriesData(location, disease, from, to);
  return (
    <TimeSeriesChart data={timeSeriesData} />
  );
}`}</code></pre>
                        <p>You would apply the same pattern to the other components, replacing calls to `riskData`, `featureImportanceData`, etc., with asynchronous calls to your new data service functions in `src/lib/db.ts`.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
