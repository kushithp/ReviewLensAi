import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string;
  reviews: string;
  platform: 'amazon' | 'flipkart' | 'unknown';
  isFallback: boolean;
}

function detectPlatform(url: string): 'amazon' | 'flipkart' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('amazon.')) return 'amazon';
  if (lowerUrl.includes('flipkart.com')) return 'flipkart';
  return 'unknown';
}

async function extractAmazonReviews(url: string): Promise<ScrapedData> {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    });
    
    const $ = cheerio.load(html);
    const title = $('#productTitle').text().trim() || 
                  $('.a-size-large.product-title-word-break').text().trim() || 
                  $('#title').text().trim() || 
                  'Amazon Product';
    
    let reviews = '';
    const reviewSelectors = [
      '[data-hook="review-body"]',
      '.review-text-content',
      '.a-expander-content.reviewText',
      '.review-text'
    ];

    reviewSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text && !reviews.includes(text)) {
          reviews += text + '\n\n';
        }
      });
    });

    if (!reviews || reviews.length < 50) {
      // Try to get product description if no reviews
      const description = $('#productDescription').text().trim() || 
                          $('#feature-bullets').text().trim();
      if (description) {
        reviews = "Product Description: " + description;
      }
    }

    if (!reviews) {
      return fallbackReviews('amazon');
    }

    return { title, reviews: reviews.slice(0, 10000), platform: 'amazon', isFallback: false };
  } catch (error) {
    console.error('Amazon Scraping Error:', error);
    return fallbackReviews('amazon');
  }
}

async function extractFlipkartReviews(url: string): Promise<ScrapedData> {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    
    const $ = cheerio.load(html);
    const title = $('.B_NuCI').text().trim() || 
                  $('._2-N8v3').text().trim() || 
                  $('.yhB1nd').text().trim() || 
                  'Flipkart Product';
    
    let reviews = '';
    const reviewSelectors = [
      '.t-ZTKy',
      '._2-N8v3',
      '._1AtVbE',
      '.qwjR-Q'
    ];

    reviewSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text && !reviews.includes(text)) {
          reviews += text + '\n\n';
        }
      });
    });

    if (!reviews || reviews.length < 50) {
      // Try to get product description if no reviews
      const description = $('._1mXcCf').text().trim() || 
                          $('._2418kt').text().trim();
      if (description) {
        reviews = "Product Description: " + description;
      }
    }

    if (!reviews) {
      return fallbackReviews('flipkart');
    }

    return { title, reviews: reviews.slice(0, 10000), platform: 'flipkart', isFallback: false };
  } catch (error) {
    console.error('Flipkart Scraping Error:', error);
    return fallbackReviews('flipkart');
  }
}

function fallbackReviews(platform: 'amazon' | 'flipkart' | 'unknown' = 'unknown'): ScrapedData {
  return {
    title: `Demo Product (${platform.charAt(0).toUpperCase() + platform.slice(1)} Fallback)`,
    reviews: "The battery life is absolutely fantastic, lasting me two full days. However, the camera quality is just average, especially in low light. The performance is buttery smooth for daily tasks, but it does tend to heat up during intensive gaming sessions. The build quality feels premium, though the screen could be brighter.",
    platform,
    isFallback: true
  };
}

export async function extractReviews(url: string): Promise<ScrapedData> {
  const platform = detectPlatform(url);
  
  if (platform === 'amazon') {
    return extractAmazonReviews(url);
  } else if (platform === 'flipkart') {
    return extractFlipkartReviews(url);
  } else {
    return fallbackReviews('unknown');
  }
}
