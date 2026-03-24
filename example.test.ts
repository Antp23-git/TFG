@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 6%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 6%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 72% 51%;
    --primary-foreground: 0 0% 100%;
    --secondary: 215 25% 27%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 5% 15%;
    --muted-foreground: 240 5% 55%;
    --accent: 240 5% 20%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5% 20%;
    --input: 240 5% 20%;
    --ring: 0 72% 51%;
    --radius: 0.375rem;
    --sidebar-background: 240 10% 5%;
    --sidebar-foreground: 0 0% 98%;
    --sidebar-primary: 0 72% 51%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 5% 15%;
    --sidebar-accent-foreground: 0 0% 98%;
    --sidebar-border: 240 5% 20%;
    --sidebar-ring: 0 72% 51%;

    --surface-elevated: 240 10% 8%;
    --surface-hover: 240 10% 12%;
    --brand-curve: cubic-bezier(0.16, 1, 0.3, 1);
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .font-display {
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: -0.04em;
    font-weight: 700;
  }

  .font-mono-data {
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
  }
}

@layer utilities {
  .shadow-card {
    box-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
  }

  .text-balance {
    text-wrap: pretty;
  }
}
