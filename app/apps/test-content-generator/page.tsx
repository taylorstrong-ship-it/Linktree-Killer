'use client';

import InstantContentGenerator from '@/components/dashboard/InstantContentGenerator';
import type { BrandDNA } from '@/lib/type-guards';

export default function TestContentGeneratorPage() {
    // Mock BrandDNA for testing with Deep Soul Intelligence
    const mockBrandDNA: BrandDNA = {
        company_name: "Millie's Italian Kitchen",
        business_type: "Restaurant",
        industry: "Food & Hospitality",
        description: "Queens-style Italian restaurant serving authentic pizza and classic dishes",
        logo_url: "https://milliesitalian.com/logo.png",
        hero_image: "https://milliesitalian.com/hero.jpg",
        brand_images: [
            "https://images.unsplash.com/photo-1565299484524-7e94a00d1bf0?w=800",
            "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800",
            "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800"
        ],
        primary_color: "#C1272D",
        secondary_color: "#1a1a1a",
        accent_color: "#FDB913",

        // Deep Soul Intelligence (GPT-5.2)
        business_intel: {
            archetype: "The Caregiver",
            atmosphere: "Family-Friendly & Cozy",
            vibe_keywords: ["Welcoming", "Authentic", "Traditional"],
            signature_items: [
                "Queens-style margherita pizza",
                "Homemade garlic knots",
                "Classic rigatoni alla vodka"
            ],
            unique_features: [
                "Wood-fired brick oven",
                "Family recipes from the 1960s"
            ],
            policies: {
                reservations: "Recommended for weekends",
                parking: "Street parking available",
                dietary: "Gluten-free crust available",
                dress_code: "Casual"
            },
            price_range: "$$",
            insider_tips: [
                "Order the garlic knots early - they sell out!",
                "Tuesday is pizza night with 20% off"
            ],
            source: "gpt-5.2_deep_soul_extraction"
        },

        // Visual Social Posts
        visual_social_posts: [
            {
                type: "Product Showcase",
                caption: "🍕 Wood-fired perfection straight from our brick oven! Our Queens-style margherita pizza is a family tradition since the 1960s. Order yours today! 🔥",
                visual_description: "Close-up of bubbling cheese on a margherita pizza fresh from the wood-fired oven",
                cta: "Order Now",
                hashtags: ["MilliesItalian", "PizzaLovers", "WoodFired", "QueensPizza"],
                original_image_url: "https://images.unsplash.com/photo-1565299484524-7e94a00d1bf0?w=800",
                enhanced_image_url: "https://images.unsplash.com/photo-1565299484524-7e94a00d1bf0?w=800&auto=enhance",
                enhancement_success: true
            },
            {
                type: "Insider Tip",
                caption: "💡 Pro tip: Order our homemade garlic knots early - they're so popular they sell out! Tuesday is pizza night with 20% off. Come hungry! 🍴",
                visual_description: "Warm, golden garlic knots drizzled with butter and parsley",
                cta: "Visit Us",
                hashtags: ["InsiderTip", "GarlicKnots", "PizzaTuesday", "MilliesItalian"],
                original_image_url: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800",
                enhanced_image_url: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&auto=enhance",
                enhancement_success: true
            },
            {
                type: "Signature Dish",
                caption: "🍝 Classic rigatoni alla vodka - made with our family's secret recipe from the 1960s. Rich, creamy, and absolutely irresistible. Gluten-free options available! 👨‍🍳",
                visual_description: "Steaming rigatoni pasta in pink vodka sauce with fresh basil",
                cta: "Book a Table",
                hashtags: ["ItalianFood", "RigatoniAllaVodka", "FamilyRecipe", "MilliesItalian"],
                original_image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800",
                enhanced_image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&auto=enhance",
                enhancement_success: true
            }
        ]
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        🎨 Instagram Content Generator Test
                    </h1>
                    <p className="text-zinc-400">
                        Testing with real Brand DNA + Deep Soul intelligence
                    </p>
                </div>

                {/* Test Instance */}
                <InstantContentGenerator brandDNA={mockBrandDNA} />

                {/* Test Info */}
                <div className="mt-12 p-6 bg-zinc-900/50 border border-white/10 rounded-2xl">
                    <h3 className="text-white font-semibold mb-4">Test Checklist</h3>
                    <ul className="space-y-2 text-sm text-zinc-300">
                        <li>✅ Verify Brand Context shows "Millie's Italian Kitchen"</li>
                        <li>✅ Check Atmosphere: "Family-Friendly & Cozy"</li>
                        <li>✅ Check Archetype: "The Caregiver"</li>
                        <li>✅ Verify Deep Soul Intelligence card shows signature items</li>
                        <li>✅ Verify insider tips display correctly</li>
                        <li>✅ Click left/right arrows to navigate carousel</li>
                        <li>✅ Verify each post shows different pizza/pasta photo</li>
                        <li>✅ Check captions reference signature items (pizza, garlic knots, rigatoni)</li>
                        <li>✅ Verify dot indicators (1/3, 2/3, 3/3)</li>
                        <li>✅ Test responsive layout (resize browser)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
