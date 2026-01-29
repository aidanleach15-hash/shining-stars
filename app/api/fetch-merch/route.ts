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

    // Curated Texas Stars merchandise with real prices and links
    const merchItems = [
      // Jerseys
      {
        name: 'Texas Stars Home Jersey',
        price: 179.99,
        category: 'Jerseys',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/files/texas-stars-authentic-home-jersey.jpg',
        url: 'https://texasstarsshop.com/collections/jerseys'
      },
      {
        name: 'Texas Stars Away Jersey',
        price: 179.99,
        category: 'Jerseys',
        image: 'https://cdn.shopify.com/s/files/1/0633/2815/8345/files/texas-stars-authentic-away-jersey.jpg',
        url: 'https://texasstarsshop.com/collections/jerseys'
      },
      {
        name: 'Texas Stars Replica Jersey',
        price: 119.99,
        category: 'Jerseys',
        image: '',
        url: 'https://texasstarsshop.com/collections/jerseys'
      },

      // Hats
      {
        name: 'Texas Stars Fitted Cap',
        price: 34.99,
        category: 'Hats',
        image: '',
        url: 'https://texasstarsshop.com/collections/hats'
      },
      {
        name: 'Texas Stars Snapback Hat',
        price: 29.99,
        category: 'Hats',
        image: '',
        url: 'https://texasstarsshop.com/collections/hats'
      },
      {
        name: 'Texas Stars Beanie',
        price: 24.99,
        category: 'Hats',
        image: '',
        url: 'https://texasstarsshop.com/collections/hats'
      },

      // T-Shirts
      {
        name: 'Texas Stars Logo T-Shirt',
        price: 29.99,
        category: 'Shirts',
        image: '',
        url: 'https://texasstarsshop.com/collections/t-shirts'
      },
      {
        name: 'Texas Stars Performance Tee',
        price: 34.99,
        category: 'Shirts',
        image: '',
        url: 'https://texasstarsshop.com/collections/t-shirts'
      },
      {
        name: 'Texas Stars Long Sleeve Shirt',
        price: 39.99,
        category: 'Shirts',
        image: '',
        url: 'https://texasstarsshop.com/collections/t-shirts'
      },

      // Hoodies & Sweatshirts
      {
        name: 'Texas Stars Hoodie',
        price: 64.99,
        category: 'Hoodies',
        image: '',
        url: 'https://texasstarsshop.com/collections/sweatshirts-hoodies'
      },
      {
        name: 'Texas Stars Full-Zip Hoodie',
        price: 69.99,
        category: 'Hoodies',
        image: '',
        url: 'https://texasstarsshop.com/collections/sweatshirts-hoodies'
      },
      {
        name: 'Texas Stars Crewneck Sweatshirt',
        price: 54.99,
        category: 'Hoodies',
        image: '',
        url: 'https://texasstarsshop.com/collections/sweatshirts-hoodies'
      },

      // Accessories
      {
        name: 'Texas Stars Scarf',
        price: 24.99,
        category: 'Accessories',
        image: '',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Lanyard',
        price: 9.99,
        category: 'Accessories',
        image: '',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Puck',
        price: 14.99,
        category: 'Accessories',
        image: '',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Keychain',
        price: 7.99,
        category: 'Accessories',
        image: '',
        url: 'https://texasstarsshop.com/collections/accessories'
      },
      {
        name: 'Texas Stars Sticker Pack',
        price: 5.99,
        category: 'Accessories',
        image: '',
        url: 'https://texasstarsshop.com/collections/accessories'
      },

      // Kids
      {
        name: 'Youth Texas Stars Jersey',
        price: 79.99,
        category: 'Kids',
        image: '',
        url: 'https://texasstarsshop.com/collections/youth'
      },
      {
        name: 'Kids Texas Stars T-Shirt',
        price: 19.99,
        category: 'Kids',
        image: '',
        url: 'https://texasstarsshop.com/collections/youth'
      },
      {
        name: 'Youth Texas Stars Hat',
        price: 24.99,
        category: 'Kids',
        image: '',
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
