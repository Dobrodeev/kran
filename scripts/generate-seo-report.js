const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell,
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  WidthType,
  ShadingType, 
  VerticalAlign,
  Header,
  Footer,
  PageNumber
} = require('docx');
const fs = require('fs');
const path = require('path');

// Colors
const NAVY = '1B2A4A';
const ACCENT_BLUE = '2563EB';
const GREEN = '16A34A';
const AMBER = 'D97706';
const RED = 'DC2626';
const ROW_BG = 'F8F9FA';
const BORDER_COLOR = 'E2E8F0';
const DARK_TEXT = '1E293B';
const BOX_BG = 'EFF6FF';

// Helper to create borders
const singleBorder = { style: BorderStyle.SINGLE, size: 8, color: BORDER_COLOR };
const cellBorders = {
  top: singleBorder,
  bottom: singleBorder,
  left: singleBorder,
  right: singleBorder,
};

// Helper for cell margins (padding)
const cellPadding = { top: 120, bottom: 120, left: 180, right: 180 };

// Helper to make a styled table cell
function makeCell(content, shading = null, columnSpan = 1, borders = cellBorders) {
  const children = Array.isArray(content) ? content : [content];
  return new TableCell({
    children,
    shading: shading ? { fill: shading, type: ShadingType.CLEAR } : undefined,
    columnSpan,
    borders,
    margins: cellPadding,
    verticalAlign: VerticalAlign.CENTER,
  });
}

// Helper to make a text paragraph
function makePara(text, options = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, font: 'Arial', color: options.color || DARK_TEXT, size: options.size || 22, bold: options.bold, italic: options.italic })];
  return new Paragraph({
    children: runs,
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.before || 100, after: options.after || 100 },
  });
}

// Create Document
const doc = new Document({
  sections: [
    // --- 1. COVER PAGE SECTION ---
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      headers: {
        default: new Header({ children: [] }) // Empty header on cover
      },
      footers: {
        default: new Footer({ children: [] }) // Empty footer on cover
      },
      children: [
        // Top spacing via spacing before
        new Paragraph({
          spacing: { before: 2000 },
          children: []
        }),
        makePara('kran-kiev-ua.web.app', { size: 72, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
        makePara('SEO / GEO / AEO Audit Report', { size: 36, bold: true, color: '93C5FD', alignment: AlignmentType.CENTER }),
        makePara('FULL AUDIT', { size: 22, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER, after: 800 }),
        
        // Score summary table on cover
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell([
                  makePara('SEO', { size: 20, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
                  makePara('8/10', { size: 72, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
                  makePara('On Track', { size: 18, italic: true, color: 'FFFFFF', alignment: AlignmentType.CENTER })
                ], GREEN, 1, { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder }),
                makeCell([
                  makePara('GEO', { size: 20, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
                  makePara('5/10', { size: 72, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
                  makePara('Needs Work', { size: 18, italic: true, color: 'FFFFFF', alignment: AlignmentType.CENTER })
                ], AMBER, 1, { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder }),
                makeCell([
                  makePara('AEO', { size: 20, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
                  makePara('6/10', { size: 72, bold: true, color: 'FFFFFF', alignment: AlignmentType.CENTER }),
                  makePara('On Track', { size: 18, italic: true, color: 'FFFFFF', alignment: AlignmentType.CENTER })
                ], AMBER, 1, { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder }),
              ]
            })
          ],
        }),
        
        new Paragraph({ spacing: { before: 2000 } }),
        makePara('Audit Date: July 1, 2026', { size: 18, color: '94A3B8', alignment: AlignmentType.CENTER }),
        makePara('Antigravity SEO Skill Specialist', { size: 18, color: '94A3B8', alignment: AlignmentType.CENTER }),
      ],
    },
    // --- 2. AUDIT CONTENT SECTION ---
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'kran-kiev-ua.web.app', font: 'Arial', size: 18, color: '94A3B8' }),
                new TextRun({ text: '\t\tSEO / GEO / AEO Audit Report', font: 'Arial', size: 18, color: '94A3B8' }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 100 }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Antigravity Digital Analyst', font: 'Arial', size: 18, color: '94A3B8' }),
                new TextRun({ text: '\t\tPage ', font: 'Arial', size: 18, color: '94A3B8' }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: '94A3B8' }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { before: 100 }
            })
          ]
        })
      },
      children: [
        // Heading 1
        new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        
        // Executive Summary Single-Cell Table Box
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell([
                  makePara('Overall Assessment:', { size: 24, bold: true, color: ACCENT_BLUE }),
                  makePara('The kran-kiev-ua.web.app website features a clean, highly responsive layout with an intuitive mobile design, customized interactive calculators, and high-quality blog content with image galleries. In traditional SEO, the site is strong with optimized title tags and dynamic single-H1 tags per route. However, GEO and AEO dimensions require significant attention. The lack of schema markup (Organization, LocalBusiness, FAQ, and Articles) creates a massive gap in how AI search engines and search assistant crawlers index and synthesize the brand entity. Implementing structured data, robots.txt, and a sitemap.xml will yield major improvements.', { size: 22, italic: true })
                ], BOX_BG)
              ]
            })
          ]
        }),

        makePara('Global Scores Summary:', { size: 24, bold: true, before: 300 }),
        
        // Detailed Scores Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('Dimension', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Score', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Status', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Key Takeaway', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('SEO (Traditional)', { size: 22 })),
                makeCell(makePara('8 / 10', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
                makeCell(makePara('On Track', { size: 22 })),
                makeCell(makePara('Excellent semantic structure, mobile response, and titles. Needs canonicals, robots.txt, and sitemap.xml.', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('GEO (AI Search)', { size: 22 })),
                makeCell(makePara('5 / 10', { size: 22, bold: true, color: 'FFFFFF' }), AMBER),
                makeCell(makePara('Needs Work', { size: 22 })),
                makeCell(makePara('High factual density but lacks organization schema, author bio nodes, and same-as entity mappings.', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('AEO (Voice/Answer)', { size: 22 })),
                makeCell(makePara('6 / 10', { size: 22, bold: true, color: 'FFFFFF' }), AMBER),
                makeCell(makePara('On Track', { size: 22 })),
                makeCell(makePara('Contains an FAQ block and lists, but misses FAQ/HowTo structured schema to unlock voice/featured snippet results.', { size: 22 })),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'Pages Audited', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        
        // Pages table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('URL', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Page Type', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Findings & Signals', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('/', { size: 22 })),
                makeCell(makePara('Homepage / SPA', { size: 22 })),
                makeCell(makePara('Has H1, customized interactive sections. Client-rendered React application. Missing canonical & OG tags.', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('/blog', { size: 22 })),
                makeCell(makePara('Blog Hub / SPA', { size: 22 })),
                makeCell(makePara('Displays 5 articles. Rich, readable layout. Missing structured sitemaps.', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('/blog/[article-id]', { size: 22 })),
                makeCell(makePara('Blog Detail', { size: 22 })),
                makeCell(makePara('Renders dynamic galleries with 3-4 images, access-keys, focus trap, and body scroll lock. Fully accessible.', { size: 22 })),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'Traditional SEO Analysis', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        makePara('Traditional SEO evaluates the site\'s accessibility for standard search engine crawlers (Googlebot, Bingbot).', { italic: true }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('SEO Signal', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Finding / Status', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Rating', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Title & Description', { size: 22 })),
                makeCell(makePara('Title: 70 chars. Description: 197 chars (slightly long). Keywords are present. Clean and keyword-rich.', { size: 22 })),
                makeCell(makePara('Good', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Canonical & OG Tags', { size: 22 })),
                makeCell(makePara('Canonical tag is missing. Open Graph (og:title, og:description, og:image) tags are missing entirely.', { size: 22 })),
                makeCell(makePara('Missing', { size: 22, bold: true, color: 'FFFFFF' }), RED),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Robots & Sitemap', { size: 22 })),
                makeCell(makePara('Neither robots.txt nor sitemap.xml exists in the public directory.', { size: 22 })),
                makeCell(makePara('Missing', { size: 22, bold: true, color: 'FFFFFF' }), RED),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Image Alts', { size: 22 })),
                makeCell(makePara('Images have descriptive alt text tags (alt={proj.title}, etc.).', { size: 22 })),
                makeCell(makePara('Good', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'GEO (Generative Engine Optimization) Analysis', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        makePara('GEO ensures content is highly discoverable, authoritative, and factually rich to win citations in LLM search outputs (Gemini, ChatGPT, Perplexity).', { italic: true }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('GEO Signal', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Finding / Status', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Rating', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('E-E-A-T Authority', { size: 22 })),
                makeCell(makePara('Has customer testimonials and footer description. The blog articles have publishing dates, but lack named authors, profiles, or bio links.', { size: 22 })),
                makeCell(makePara('Attention', { size: 22, bold: true, color: 'FFFFFF' }), AMBER),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Factual Density', { size: 22 })),
                makeCell(makePara('Excellent. High density of numbers (capacities, rates, heights, safety guidelines), specific crane brands, and clear terms.', { size: 22 })),
                makeCell(makePara('Good', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Structured Entity Schema', { size: 22 })),
                makeCell(makePara('No JSON-LD schema is present. Missing Organization, LocalBusiness, and sameAs links to link the entity in the search graph.', { size: 22 })),
                makeCell(makePara('Missing', { size: 22, bold: true, color: 'FFFFFF' }), RED),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'AEO (Answer Engine Optimization) Analysis', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        makePara('AEO optimizes content for voice search queries, instant answers, and featured snippet blocks.', { italic: true }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('AEO Signal', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Finding / Status', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Rating', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Snippet Compatibility', { size: 22 })),
                makeCell(makePara('The FAQ section and blog articles use clean numbered lists, bullet points, and definition blocks that are snippet-friendly.', { size: 22 })),
                makeCell(makePara('Good', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('FAQ Schema', { size: 22 })),
                makeCell(makePara('FAQ component exists in UI, but has no FAQPage structured data markup to unlock AEO results.', { size: 22 })),
                makeCell(makePara('Missing', { size: 22, bold: true, color: 'FFFFFF' }), RED),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Local Voice Signals', { size: 22 })),
                makeCell(makePara('Excellent address, map rendering, and local phone coverage. Strongly aligned with conversational local searches.', { size: 22 })),
                makeCell(makePara('Good', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'Priority Recommendations Matrix', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('Priority', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Recommended Action', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Dimension', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Effort', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Impact', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Critical', { size: 22, bold: true, color: 'FFFFFF' }), RED),
                makeCell(makePara('Add robots.txt and sitemap.xml pointing to all pages and blog articles.', { size: 22 })),
                makeCell(makePara('SEO', { size: 22 })),
                makeCell(makePara('Low', { size: 22 })),
                makeCell(makePara('High', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('High', { size: 22, bold: true, color: 'FFFFFF' }), 'EA580C'),
                makeCell(makePara('Implement JSON-LD Schema (Organization, LocalBusiness, FAQPage, Article) in index.html.', { size: 22 })),
                makeCell(makePara('GEO / AEO', { size: 22 })),
                makeCell(makePara('Medium', { size: 22 })),
                makeCell(makePara('High', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Medium', { size: 22, bold: true, color: 'FFFFFF' }), AMBER),
                makeCell(makePara('Insert canonical link and Open Graph tags (og:title, etc.) into index.html head.', { size: 22 })),
                makeCell(makePara('SEO', { size: 22 })),
                makeCell(makePara('Low', { size: 22 })),
                makeCell(makePara('Medium', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Quick Win', { size: 22, bold: true, color: 'FFFFFF' }), GREEN),
                makeCell(makePara('Add author profile/metadata block and credentials to the blog articles page.', { size: 22 })),
                makeCell(makePara('GEO (E-E-A-T)', { size: 22 })),
                makeCell(makePara('Low', { size: 22 })),
                makeCell(makePara('Medium', { size: 22 })),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'What is Working Well', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                makeCell(makePara('Strength', { size: 22, bold: true }), ROW_BG),
                makeCell(makePara('Details & Evidence', { size: 22, bold: true }), ROW_BG),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Highly Performant & Mobile Friendly', { size: 22 })),
                makeCell(makePara('The website is lightweight, loads fast, uses clean CSS grid structures, and maintains a 100% accessible layout on both mobile and desktop (Vite compiled code).', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Dynamic and Factual Content', { size: 22 })),
                makeCell(makePara('The blog section has been successfully expanded to 5 articles, providing highly factual, dense information (exact safety limits, capacities, winter operation details) that AI search engines prefer to cite.', { size: 22 })),
              ]
            }),
            new TableRow({
              children: [
                makeCell(makePara('Interactive Elements & CTA', { size: 22 })),
                makeCell(makePara('Interactive calculators and booking forms provide high user engagement, reducing bounce rate (key ranking factor).', { size: 22 })),
              ]
            }),
          ]
        }),

        new Paragraph({ text: 'Glossary', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        makePara('• SEO (Search Engine Optimization): Optimizing content for ranking on traditional search engine results pages.', { size: 20, before: 100 }),
        makePara('• GEO (Generative Engine Optimization): Enhancing factual density, E-E-A-T authority signals, and structured entities to win citations in LLM summaries.', { size: 20, before: 100 }),
        makePara('• AEO (Answer Engine Optimization): Formatting content structure (Q&As, lists, tables) to easily feed voice searches and featured snippets.', { size: 20, before: 100 }),
      ]
    }
  ]
});

// Write to files
const docxPath = path.join('d:', 'Work', 'kranua.com mobile friendly', '.git', 'sdd', 'seo-audit-kran-kiev-ua-2026-07-01.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(docxPath, buffer);
  console.log(`Successfully generated DOCX at: ${docxPath}`);
}).catch(err => {
  console.error('Error writing DOCX:', err);
  process.exit(1);
});
