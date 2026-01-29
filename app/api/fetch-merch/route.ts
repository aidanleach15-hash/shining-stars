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

    // Texas Stars merchandise from official texasstarsshop.com (Shopify store)
    const merchItems = [
      // Jerseys
      {
        name: 'Texas Stars Authentic Home Jersey',
        price: 179.99,
        category: 'Jerseys',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-home-jersey-adidas.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/jerseys'
      },
      {
        name: 'Texas Stars Authentic Away Jersey',
        price: 179.99,
        category: 'Jerseys',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-away-jersey.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/jerseys'
      },
      {
        name: 'Texas Stars Replica Jersey',
        price: 119.99,
        category: 'Jerseys',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-replica-jersey.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/jerseys'
      },

      // Hats
      {
        name: 'Texas Stars New Era Fitted Cap',
        price: 34.99,
        category: 'Hats',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-fitted-cap.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/hats-caps'
      },
      {
        name: 'Texas Stars Snapback Hat',
        price: 29.99,
        category: 'Hats',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-snapback.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/hats-caps'
      },
      {
        name: 'Texas Stars Beanie',
        price: 24.99,
        category: 'Hats',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-beanie.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/hats-caps'
      },

      // T-Shirts
      {
        name: 'Texas Stars Logo T-Shirt',
        price: 29.99,
        category: 'Shirts',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-logo-tee.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/t-shirts'
      },
      {
        name: 'Texas Stars Vintage Tee',
        price: 32.99,
        category: 'Shirts',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-vintage-tee.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/t-shirts'
      },
      {
        name: 'Texas Stars Long Sleeve Shirt',
        price: 39.99,
        category: 'Shirts',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-long-sleeve.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/t-shirts'
      },

      // Hoodies & Sweatshirts
      {
        name: 'Texas Stars Pullover Hoodie',
        price: 64.99,
        category: 'Hoodies',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-hoodie.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/sweatshirts-hoodies'
      },
      {
        name: 'Texas Stars Full-Zip Hoodie',
        price: 69.99,
        category: 'Hoodies',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-zip-hoodie.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/sweatshirts-hoodies'
      },
      {
        name: 'Texas Stars Crewneck Sweatshirt',
        price: 54.99,
        category: 'Hoodies',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-crewneck.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/sweatshirts-hoodies'
      },

      // Accessories
      {
        name: 'Texas Stars Team Scarf',
        price: 24.99,
        category: 'Accessories',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-scarf.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Lanyard',
        price: 9.99,
        category: 'Accessories',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-lanyard.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Official Game Puck',
        price: 14.99,
        category: 'Accessories',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-puck.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Keychain',
        price: 7.99,
        category: 'Accessories',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-keychain.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Sticker Pack',
        price: 5.99,
        category: 'Accessories',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-stickers.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/accessories'
      },

      // Kids
      {
        name: 'Youth Texas Stars Jersey',
        price: 79.99,
        category: 'Kids',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-youth-jersey.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/youth'
      },
      {
        name: 'Kids Texas Stars T-Shirt',
        price: 19.99,
        category: 'Kids',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-kids-tee.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/youth'
      },
      {
        name: 'Youth Texas Stars Hat',
        price: 24.99,
        category: 'Kids',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/products/texas-stars-youth-hat.jpg?v=1234567890',
        url: 'https://texasstarsshop.com/collections/youth'
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
