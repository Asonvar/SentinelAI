// import type { Metadata } from "next";
// import { Inter, Cinzel } from "next/font/google";
// import "./globals.css";

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

// const cinzel = Cinzel({
//   variable: "--font-cinzel",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "SentinelAI",
//   description: "Take Control",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${inter.variable} ${cinzel.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelAI",
  description: "Take Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
