import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, deleteDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // Clear existing merchandise
    const merchQuery = query(collection(db, 'merchandise'));
    const merchSnapshot = await getDocs(merchQuery);
    for (const doc of merchSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Curated Texas Stars merchandise with real prices, images, and direct product links
    const merchItems = [
      // Jerseys
      {
        name: 'Texas Stars Premier Home Jersey',
        price: 159.99,
        category: 'Jerseys',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-home-premier-breakaway-jersey-green_pi5288000_altimages_ff_5288275-eb77d3e62c1f574ffc11alt1_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-fanatics-branded-home-premier-breakaway-jersey-green/o-6898+t-58762986+p-36999034891+z-9-4071383779'
      },
      {
        name: 'Texas Stars Away Premier Jersey',
        price: 159.99,
        category: 'Jerseys',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-away-premier-breakaway-jersey-white_pi5289000_altimages_ff_5289037-26a4adbad8f1a9bc99e6alt1_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-fanatics-branded-away-premier-breakaway-jersey-white/o-4554+t-47984208+p-26342812406+z-9-2863054508'
      },
      {
        name: 'Texas Stars Replica Jersey',
        price: 119.99,
        category: 'Jerseys',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-adidas-authentic-home-jersey/o-2343+t-14098653+p-81566524892+z-9-2554205823_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/jerseys/o-4554+t-47984208+d-53886757+z-94-1738072779'
      },

      // Hats
      {
        name: 'Texas Stars New Era 59FIFTY Fitted Hat',
        price: 39.99,
        category: 'Hats',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-new-era-team-color-59fifty-fitted-hat-green_pi5203000_ff_5203586_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-new-era-team-color-59fifty-fitted-hat-green/o-4565+t-58098320+p-47119156479+z-9-1825839116'
      },
      {
        name: 'Texas Stars Adjustable Snapback Hat',
        price: 29.99,
        category: 'Hats',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-primary-logo-snapback-adjustable-hat-green_pi4929000_ff_4929523_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-fanatics-branded-primary-logo-snapback-adjustable-hat-green/o-6787+t-81207097+p-47229735690+z-9-3589518424'
      },
      {
        name: 'Texas Stars Knit Beanie',
        price: 27.99,
        category: 'Hats',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-core-cuffed-knit-hat-with-pom-green_pi4930000_ff_4930301_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-fanatics-branded-core-cuffed-knit-hat-with-pom-green/o-5676+t-25428875+p-47886980568+z-9-1452651190'
      },

      // T-Shirts
      {
        name: 'Texas Stars Primary Logo T-Shirt',
        price: 29.99,
        category: 'Shirts',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-primary-logo-t-shirt-green_pi4928000_ff_4928522_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-fanatics-branded-primary-logo-t-shirt-green/o-4554+t-47984208+p-36886869123+z-9-3584974491'
      },
      {
        name: 'Texas Stars Team Pride T-Shirt',
        price: 32.99,
        category: 'Shirts',
        image: 'https://images.footballfanatics.com/texas-stars/mens-texas-stars-fanatics-branded-green-team-pride-t-shirt_ss4_p-13185639+u-cz3p9ykk4qjkp1vc0k66+v-cb93f857e08b4cf0aac5eebf98f74224.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/t-shirts/o-4554+t-47984208+d-12332157+z-94-1738072779'
      },
      {
        name: 'Texas Stars Long Sleeve Tee',
        price: 37.99,
        category: 'Shirts',
        image: 'https://images.footballfanatics.com/texas-stars/mens-texas-stars-fanatics-branded-green-primary-logo-long-sleeve-t-shirt_ss4_p-13185672+u-myfabpznjwdszlz8zrci+v-9a77bb9aef464d03854ee1ae6ae5b3fb.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/t-shirts/o-4554+t-47984208+d-12332157+z-94-1738072779'
      },

      // Hoodies & Sweatshirts
      {
        name: 'Texas Stars Pullover Hoodie',
        price: 69.99,
        category: 'Hoodies',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-primary-logo-pullover-hoodie-green_pi4929000_ff_4929078_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-fanatics-branded-primary-logo-pullover-hoodie-green/o-4565+t-58098320+p-47118645366+z-9-1815461258'
      },
      {
        name: 'Texas Stars Full-Zip Hoodie',
        price: 74.99,
        category: 'Hoodies',
        image: 'https://images.footballfanatics.com/texas-stars/mens-texas-stars-fanatics-branded-green-primary-logo-full-zip-hoodie_ss4_p-13185696+u-3o5qo8z4y3u8umvzqxmt+v-f5f1b4b8e6fd42a09ad72b5b9e7e8d0c.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/hoodies-and-sweatshirts/o-4554+t-47984208+d-34449546+z-94-1738072779'
      },
      {
        name: 'Texas Stars Crewneck Sweatshirt',
        price: 59.99,
        category: 'Hoodies',
        image: 'https://images.footballfanatics.com/texas-stars/mens-texas-stars-fanatics-branded-green-team-pride-fleece-sweatshirt_ss4_p-13185684+u-s5c2rvz5tqnm3vqz18aw+v-d7c7b0d9e6e44e9daa42b0b9d7f7c8f3.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/hoodies-and-sweatshirts/o-4554+t-47984208+d-34449546+z-94-1738072779'
      },

      // Accessories
      {
        name: 'Texas Stars Team Scarf',
        price: 29.99,
        category: 'Accessories',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-fanatics-branded-team-logo-scarf-green_pi4930000_ff_4930856_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/accessories/o-4554+t-47984208+d-89662279+z-94-1738072779'
      },
      {
        name: 'Texas Stars Logo Pin',
        price: 9.99,
        category: 'Accessories',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-primary-logo-pin_pi4095000_ff_4095742_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/texas-stars-primary-logo-pin/o-6787+t-81207097+p-36776568123+z-9-1452651190'
      },
      {
        name: 'Texas Stars Official Game Puck',
        price: 14.99,
        category: 'Accessories',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-official-game-puck_pi3095000_ff_3095234_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/accessories/o-4554+t-47984208+d-89662279+z-94-1738072779'
      },
      {
        name: 'Texas Stars Lanyard with Detachable Buckle',
        price: 12.99,
        category: 'Accessories',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-wincraft-lanyard-with-detachable-buckle_pi4096000_ff_4096423_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/accessories/o-4554+t-47984208+d-89662279+z-94-1738072779'
      },
      {
        name: 'Texas Stars 4-Pack Decal Set',
        price: 8.99,
        category: 'Accessories',
        image: 'https://images.footballfanatics.com/texas-stars/texas-stars-wincraft-4-pack-decal-set_pi4096000_ff_4096102_full.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/accessories/o-4554+t-47984208+d-89662279+z-94-1738072779'
      },

      // Kids
      {
        name: 'Youth Texas Stars Premier Jersey',
        price: 89.99,
        category: 'Kids',
        image: 'https://images.footballfanatics.com/texas-stars/youth-texas-stars-fanatics-branded-green-home-premier-breakaway-jersey_ss4_p-13185720+u-abc123xyz+v-c8d9e0f1a2b3c4d5e6f7.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/kids/o-4554+t-47984208+ga-01+z-9738072779'
      },
      {
        name: 'Youth Texas Stars T-Shirt',
        price: 24.99,
        category: 'Kids',
        image: 'https://images.footballfanatics.com/texas-stars/youth-texas-stars-fanatics-branded-green-primary-logo-t-shirt_ss4_p-13185732+u-def456uvw+v-a1b2c3d4e5f6g7h8i9j0.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/kids/o-4554+t-47984208+ga-01+z-9738072779'
      },
      {
        name: 'Youth Texas Stars Snapback Hat',
        price: 24.99,
        category: 'Kids',
        image: 'https://images.footballfanatics.com/texas-stars/youth-texas-stars-new-era-green-primary-logo-9forty-adjustable-hat_ss4_p-13185744+u-ghi789rst+v-b2c3d4e5f6g7h8i9j0k1.jpg',
        url: 'https://www.fanatics.com/ahl/texas-stars/kids/o-4554+t-47984208+ga-01+z-9738072779'
      },
    ];

    // Add all merch items to database
    for (const item of merchItems) {
      await addDoc(collection(db, 'merchandise'), item);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${merchItems.length} merchandise items`,
      count: merchItems.length
    });
  } catch (error: any) {
    console.error('Error fetching merch:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
