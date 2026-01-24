import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Linktree Killer - Link in Bio Builder",
    description: "Multi-user Linktree builder with AI auto-import",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                />
            </head>
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
