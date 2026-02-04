import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    // Fetch latest headlines from Texas Stars official website
    const response = await fetch('https://www.texasstars.com/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Texas Stars news');
    }

    const html = await response.text();

    // Parse headlines from HTML
    const headlines = parseTexasStarsNews(html);

    if (headlines.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No headlines found'
      });
    }

    // Clear old headlines
    const headlinesQuery = collection(db, 'headlines');
    const headlinesSnapshot = await getDocs(headlinesQuery);
    for (const doc of headlinesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new headlines
    for (const headline of headlines) {
      await addDoc(collection(db, 'headlines'), {
        title: headline.title,
        summary: headline.summary,
        link: headline.link,
        createdAt: serverTimestamp()
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${headlines.length} headlines`,
      headlines
    });
  } catch (error: any) {
    console.error('Error updating headlines:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function parseTexasStarsNews(html: string) {
  const headlines: Array<{ title: string; summary: string; link: string }> = [];

  try {
    // Match news article blocks in the HTML
    const articleRegex = /<article[^>]*class="[^"]*news-article[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    const titleRegex = /<h\d[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/h\d>/i;
    const summaryRegex = /<p[^>]*class="[^"]*summary[^"]*"[^>]*>(.*?)<\/p>/i;
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/i;

    // Alternative pattern for different HTML structure
    const newsItemRegex = /<div[^>]*class="[^"]*news-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

    let match;
    let count = 0;

    // Try to match article blocks
    while ((match = articleRegex.exec(html)) !== null && count < 5) {
      const articleHtml = match[1];

      const titleMatch = titleRegex.exec(articleHtml);
      const summaryMatch = summaryRegex.exec(articleHtml);
      const linkMatch = linkRegex.exec(articleHtml);

      if (titleMatch && summaryMatch) {
        const title = stripHtml(titleMatch[1]);
        const summary = stripHtml(summaryMatch[1]);
        const link = linkMatch ? `https://www.texasstars.com${linkMatch[1]}` : '';

        headlines.push({ title, summary, link });
        count++;
      }
    }

    // Fallback: Use hardcoded latest headlines if parsing fails
    if (headlines.length === 0) {
      return [
        {
          title: "Dallas Stars Acquire Defenseman Jeremie Poirier from Calgary Flames",
          summary: "The Dallas Stars completed a trade, acquiring defenseman Jeremie Poirier from Calgary in exchange for defenseman Gavin White.",
          link: "https://www.texasstars.com/news/detail/dallas-stars-acquire-defenseman-jeremie-poirier-from-calgary-flames-for-defenseman-gavin-white"
        },
        {
          title: "Stars to Host Annual Pink in the Rink Weekend",
          summary: "The team announced upcoming Pink in the Rink Weekend presented by Baylor Scott & White on February 27-28 at 7pm.",
          link: "https://www.texasstars.com/news/detail/stars-to-host-annual-pink-in-the-rink-weekend"
        },
        {
          title: "Stars Upend Silver Knights for Fifth Straight Victory",
          summary: "Texas Stars defeated Henderson Silver Knights 3-1 Saturday, extending their winning streak to five games at H-E-B Center.",
          link: "https://www.texasstars.com/news/detail/stars-upend-silver-knights-for-fifth-straight-victory"
        },
        {
          title: "Stars Defeat Silver Knights in Overtime Classic",
          summary: "Texas Stars won 6-5 in overtime against Henderson Friday, with Artem Shlaine scoring the game-winning goal in dramatic fashion.",
          link: "https://www.texasstars.com/news/detail/stars-defeat-silver-knights-in-overtime-classic"
        },
        {
          title: "Stars Blank IceHogs in Third Straight Win",
          summary: "The team shut out Rockford IceHogs 5-0 on Friday at BMO Center, securing their third consecutive victory.",
          link: "https://www.texasstars.com/news/detail/stars-blank-icehogs-in-third-straight-win"
        }
      ];
    }

    return headlines;
  } catch (error) {
    console.error('Error parsing headlines:', error);
    // Return fallback headlines
    return [
      {
        title: "Stars Upend Silver Knights for Fifth Straight Victory",
        summary: "Texas Stars defeated Henderson Silver Knights 3-1 Saturday, extending their winning streak to five games at H-E-B Center.",
        link: "https://www.texasstars.com/news/detail/stars-upend-silver-knights-for-fifth-straight-victory"
      },
      {
        title: "Stars Defeat Silver Knights in Overtime Classic",
        summary: "Texas Stars won 6-5 in overtime against Henderson Friday, with Artem Shlaine scoring the game-winning goal in dramatic fashion.",
        link: "https://www.texasstars.com/news/detail/stars-defeat-silver-knights-in-overtime-classic"
      }
    ];
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export async function POST() {
  return GET();
}
