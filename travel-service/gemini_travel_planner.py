import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai

# Import weather agent only (city data now comes from Spring Boot)
from weather_agent import get_weather

# Load environment variables
load_dotenv()

# Initialize Google Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=gemini_api_key)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_trip_plan(origin, destination, start_date, day_count, budget, weather_data, city_data):
    """
    Generate a trip plan using Google Gemini LLM with weather and city database information.
    
    Args:
        origin (str): Origin city
        destination (str): Destination city  
        start_date (str): Start date in YYYY-MM-DD format
        day_count (int): Number of days for the trip
        budget (int): Total budget in Taka
        weather_data (list): Weather forecast for each day
        city_data (dict): Complete city database with spots, hotels, restaurants (from Spring Boot)
        
    Returns:
        str: Generated trip plan from the LLM
    """
    # Format weather data for the prompt
    print("🌤️The key...", gemini_api_key[:10] + "..." if gemini_api_key else "Not found")
    weather_info = ""
    if isinstance(weather_data, list):
        for i, weather in enumerate(weather_data[:day_count]):
            date = weather.get('date', f'Day {i+1}')
            # Handle different weather data formats
            if 'morning' in weather:
                # Format from weather agent - show morning, afternoon, and night
                morning = weather.get('morning', {})
                afternoon = weather.get('afternoon', {})
                night = weather.get('night', {})
                
                # Morning info
                morning_conditions = morning.get('conditions', 'Unknown')
                morning_temp = morning.get('temperature', 'N/A')
                morning_precipitation = morning.get('precipitation_chance', 0)
                morning_humidity = morning.get('humidity', 0)
                
                # Afternoon info
                afternoon_conditions = afternoon.get('conditions', 'Unknown')
                afternoon_temp = afternoon.get('temperature', 'N/A')
                afternoon_precipitation = afternoon.get('precipitation_chance', 0)
                
                # Night info
                night_conditions = night.get('conditions', 'Unknown')
                night_temp = night.get('temperature', 'N/A')
                
                weather_info += f"Day {i+1} ({date}):\n"
                weather_info += f"  Morning: {morning_conditions}, {morning_temp}°C, Rain: {morning_precipitation}%, Humidity: {morning_humidity}%\n"
                weather_info += f"  Afternoon: {afternoon_conditions}, {afternoon_temp}°C, Rain: {afternoon_precipitation}%\n"
                weather_info += f"  Night: {night_conditions}, {night_temp}°C\n"
            else:
                # Handle simple format or fallback
                conditions = weather.get('condition', weather.get('conditions', 'Unknown'))
                temp_max = weather.get('temp_max', weather.get('temperature', 'N/A'))
                temp_min = weather.get('temp_min', 'N/A')
                rain_chance = weather.get('rain_chance', weather.get('precipitation_chance', 0))
                humidity = weather.get('humidity', 0)
                weather_info += f"Day {i+1} ({date}): {conditions}, High: {temp_max}°C, Low: {temp_min}°C, Rain: {rain_chance}%, Humidity: {humidity}%\n"
    else:
        weather_info = "Weather data unavailable\n"
    
    # Format city data efficiently for the prompt (don't include all raw data)
    spots_summary = []
    hotels_summary = []
    restaurants_summary = []
    
    # Print the raw structure of the first few items to diagnose the issue
    print("\n🔍 DETAILED DATA INSPECTION:")
    print("City data type:", type(city_data))
    print("City data keys:", list(city_data.keys()) if isinstance(city_data, dict) else "Not a dict")
    
    # Debugging spots data structure
    if city_data.get('spots'):
        print("\nSPOTS DATA STRUCTURE:")
        if city_data['spots'] and len(city_data['spots']) > 0:
            first_spot = city_data['spots'][0]
            print(f"First spot data type: {type(first_spot)}")
            print(f"First spot keys: {list(first_spot.keys()) if isinstance(first_spot, dict) else 'Not a dict'}")
            print(f"First spot raw data: {first_spot}")
    
    if city_data.get('spots'):
        for spot in city_data['spots']:
            # Check if 'name' is used instead of 'spot_name'
            spot_name = None
            if spot.get('spot_name'):
                spot_name = spot.get('spot_name')
            elif spot.get('name'):  # Check if the key is 'name' instead of 'spot_name'
                spot_name = spot.get('name')
                
            if not spot_name or spot_name == 'Unknown':
                continue
                
            # Try to get location information for better geographic planning
            location = spot.get('location', spot.get('area', ''))
            
            spots_summary.append({
                "spot_name": spot_name,
                "description": spot.get('description', 'Tourist attraction'),
                "entry_fee": spot.get('entry_fee', 0),
                "location": location  # Add location if available for better geographic planning
            })
    
    if city_data.get('hotels'):
        # Debug hotel data structure
        if city_data['hotels'] and len(city_data['hotels']) > 0:
            first_hotel = city_data['hotels'][0]
            print(f"\nHOTELS DATA STRUCTURE:")
            print(f"First hotel data type: {type(first_hotel)}")
            print(f"First hotel keys: {list(first_hotel.keys()) if isinstance(first_hotel, dict) else 'Not a dict'}")
            print(f"First hotel raw data: {first_hotel}")
            
        for hotel in city_data['hotels']:
            # Check if 'name' is used instead of 'hotel_name'
            hotel_name = None
            if hotel.get('hotel_name'):
                hotel_name = hotel.get('hotel_name')
            elif hotel.get('name'):  # Check if the key is 'name' instead of 'hotel_name'
                hotel_name = hotel.get('name')
                
            if not hotel_name or hotel_name == 'Unknown':
                continue
                
            # Try to get location information for better geographic planning
            location = hotel.get('location', hotel.get('area', ''))
                
            hotels_summary.append({
                "hotel_name": hotel_name,
                "price_range": f"{hotel.get('price_min', 0)}-{hotel.get('price_max', 0)}",
                "rating": hotel.get('rating', 0),
                "amenities": hotel.get('amenities', 'Standard amenities'),
                "location": location  # Add location if available for better geographic planning
            })
    
    if city_data.get('restaurants'):
        # Debug restaurant data structure
        if city_data['restaurants'] and len(city_data['restaurants']) > 0:
            first_restaurant = city_data['restaurants'][0]
            print(f"\nRESTAURANTS DATA STRUCTURE:")
            print(f"First restaurant data type: {type(first_restaurant)}")
            print(f"First restaurant keys: {list(first_restaurant.keys()) if isinstance(first_restaurant, dict) else 'Not a dict'}")
            print(f"First restaurant raw data: {first_restaurant}")
            
        for restaurant in city_data['restaurants']:
            # Check if 'name' is used instead of 'restaurant_name'
            restaurant_name = None
            if restaurant.get('restaurant_name'):
                restaurant_name = restaurant.get('restaurant_name')
            elif restaurant.get('name'):  # Check if the key is 'name' instead of 'restaurant_name'
                restaurant_name = restaurant.get('name')
                
            if not restaurant_name or restaurant_name == 'Unknown':
                continue
                
            # Try to get location information for better geographic planning
            location = restaurant.get('location', restaurant.get('area', ''))
                
            restaurants_summary.append({
                "restaurant_name": restaurant_name,
                "cuisine": restaurant.get('cuisine_type', 'Local'),
                "avg_cost": restaurant.get('avg_cost', 500),
                "rating": restaurant.get('rating', 4.0),
                "location": location  # Add location if available for better geographic planning
            })
    
    city_summary = {
        "spots": spots_summary,
        "hotels": hotels_summary,
        "restaurants": restaurants_summary
    }
    
    city_info = json.dumps(city_summary, indent=2, ensure_ascii=False)
    
    # Print debug information about the data being used
    print("📊 Data Summary:")
    print(f"   Destination: {destination}")
    print(f"   Start Date: {start_date}")
    print(f"   Day Count: {day_count}")
    print(f"   Budget: ৳{budget}")
    
    # Weather data is a list of daily forecasts, not a dict
    if isinstance(weather_data, list) and weather_data:
        print(f"   Weather data: Available ({len(weather_data)} days)")
    elif isinstance(weather_data, dict) and weather_data.get('error'):
        print(f"   Weather data: Error - {weather_data.get('error')}")
    else:
        print("   Weather data: Not available")
    
    # Print detailed data availability information
    print(f"   City data structure valid: {isinstance(city_data, dict)}")
    if isinstance(city_data, dict):
        print(f"   City data success flag: {city_data.get('success', False)}")
        print(f"   Spots available: {len(city_data.get('spots', []))}")
        print(f"   Hotels available: {len(city_data.get('hotels', []))}")
        print(f"   Restaurants available: {len(city_data.get('restaurants', []))}")
        print(f"   City data source: {city_data.get('data_source', 'Unknown')}")
    else:
        print(f"   City data type: {type(city_data)}")
    print()
    
    # Show ALL available data for complete debugging
    if city_data.get('spots'):
        print("🏛️ ALL AVAILABLE SPOTS (Gemini must use these exact names):")
        for spot in city_data['spots']:
            spot_name = spot.get('spot_name') or spot.get('name') or 'Unknown spot'
            print(f"   • \"{spot_name}\"")
            if spot_name == 'Unknown spot':
                print(f"     (Debug: keys available: {list(spot.keys())})")
    
    if city_data.get('hotels'):
        print("🏨 ALL AVAILABLE HOTELS (Gemini must use these exact names):")
        for hotel in city_data['hotels']:
            hotel_name = hotel.get('hotel_name') or hotel.get('name') or 'Unknown hotel'
            print(f"   • \"{hotel_name}\" - ৳{hotel.get('price_min', 'N/A')}")
            if hotel_name == 'Unknown hotel':
                print(f"     (Debug: keys available: {list(hotel.keys())})")
    
    if city_data.get('restaurants'):
        print("🍽️ ALL AVAILABLE RESTAURANTS (Gemini must use these exact names):")
        for restaurant in city_data['restaurants']:
            restaurant_name = restaurant.get('restaurant_name') or restaurant.get('name') or 'Unknown restaurant'
            print(f"   • \"{restaurant_name}\" - ৳{restaurant.get('avg_cost', 'N/A')}")
            if restaurant_name == 'Unknown restaurant':
                print(f"     (Debug: keys available: {list(restaurant.keys())})")
    print()
    
    # Create a clean, focused prompt for the LLM
    prompt = f"""Create a detailed travel itinerary using the provided data.

## Trip Parameters:
- From: {origin} → To: {destination}
- Start: {start_date} | Duration: {day_count} days
- Budget: ৳{budget}

## Weather Forecast:
{weather_info}

## Available Data:
{city_info}

## CRITICAL INSTRUCTIONS:
-Firstly you must choose the places where people will visit at that particular time of the day.
- You MUST ONLY use the exact spot_name, hotel_name, and restaurant_name values from the data provided above
- DO NOT invent or create any spots, hotels, or restaurants that are not in the data
- DO NOT use "Unknown" as a value for any spot_name, hotel_name, or restaurant_name
- Every spot_name, hotel_name, and restaurant_name you use MUST be copied EXACTLY from the data above
- If no valid spots, hotels, or restaurants are available, respond with an error message instead of making up names
- REALISTIC GEOGRAPHY: For each day, only include spots that are geographically close to each other
- GROUP BY LOCATION: Plan each day around spots in the same area to minimize travel time

## Task:
Generate a comprehensive JSON travel plan using ONLY the provided spots, hotels, and restaurants from the data above.

## Required JSON Structure:
{{
  "trip_summary": {{
    "origin": "{origin}",
    "destination": "{destination}",
    "start_date": "{start_date}",
    "duration": {day_count},
    "total_budget": {budget}
  }},

  "daily_itinerary": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "weather": "weather description",

      "transportation_morning": {{
        "from": "hotel or city",
        "to": "morning spot name",
        "mode": "rickshaw / car / boat / walk / train / bus",
        "departure_time": "8:30 AM",
        "arrival_time": "9:00 AM",
        "cost": 100
      }},
      "morning_activity": {{
        "spot_name": "use spot from data",
        "time": "9:00 AM - 11:00 AM",
        "description": "activity details",
        "entry_fee": 0,
        "image_url": "/trip-images/spot.jpg"
      }},
      
      "transportation_lunch": {{
        "from": "morning spot name",
        "to": "restaurant name",
        "mode": "walk / rickshaw / etc.",
        "departure_time": "11:00 AM",
        "arrival_time": "11:15 AM",
        "cost": 50
      }},
      "lunch_options": [
        {{
          "restaurant_name": "from data",
          "cuisine": "type",
          "cost_per_person": 400,
          "rating": 4.0,
          "image_url": "/trip-images/restaurant.jpg",
          "time": "11:15 AM - 12:30 PM"
        }}
      ],

      "transportation_afternoon": {{
        "from": "restaurant name",
        "to": "afternoon spot name",
        "mode": "car / rickshaw",
        "departure_time": "12:30 PM",
        "arrival_time": "1:00 PM",
        "cost": 150
      }},
      "afternoon_activities": [
        {{
          "spot_name": "from data",
          "time": "1:00 PM - 5:00 PM",
          "description": "what to do",
          "entry_fee": 0,
          "image_url": "/trip-images/spot.jpg"
        }}
      ],

      "transportation_dinner": {{
        "from": "afternoon spot",
        "to": "restaurant name",
        "mode": "walk / rickshaw / car",
        "departure_time": "5:00 PM",
        "arrival_time": "5:30 PM",
        "cost": 80
      }},
      "dinner_options": [
        {{
          "restaurant_name": "from data",
          "cuisine": "type",
          "cost_per_person": 500,
          "rating": 4.2,
          "image_url": "/trip-images/restaurant.jpg",
          "time": "5:30 PM - 7:00 PM"
        }}
      ],

      "transportation_hotel": {{
        "from": "restaurant",
        "to": "hotel name",
        "mode": "car / walk",
        "departure_time": "7:00 PM",
        "arrival_time": "7:30 PM",
        "cost": 100
      }},
      "accommodation_options": [
        {{
          "hotel_name": "from data",
          "rating": 4.0,
          "cost_per_night": 3000,
          "amenities": "features",
          "image_url": "/trip-images/hotel.jpg",
          "check_in_time": "7:30 PM"
        }}
      ],

      "day_budget": {{
        "accommodation": 3000,
        "meals": 900,
        "activities": 50,
        "transport": 480,
        "misc": 100,
        "total": 4530
      }}
    }}
  ],
  "budget_summary": {{
    "total_accommodation": 9000,
    "total_meals": 2700,
    "total_activities": 150,
    "total_transport": 1440,
    "total_misc": 300,
    "grand_total": 13590,
    "remaining": -3590
  }}
}}

Instructions:
- Use ONLY the spots, hotels, and restaurants from the provided data - do not invent places
- Copy the exact spot_name, hotel_name, and restaurant_name values - do not modify them
- If no valid data is available for a particular item, return an error message like:
  {{
    "error": "Insufficient data available for [destination]",
    "missing_data": ["spots", "hotels", "restaurants"]
  }}
- Include transportation details between activities, meals, and hotels
- Choose realistic transportation modes based on the distance between origin and destination.
  For example, avoid using rickshaws for intercity travel like Dhaka to Sylhet or Jaflong
- **REALISTIC DAILY PLANNING**: 
  * Group activities by geographic proximity - only visit places close to each other in a single day
  * Morning and afternoon spots should be in the same area or nearby areas
  * Choose restaurants close to the spots you're visiting
  * Avoid planning unrealistic travel distances within a single day
- **REALISTIC TRANSPORTATION**:
  * Use appropriate transportation modes based on distances
  * Include realistic travel times between locations (longer for distant places)
  * Consider traffic conditions in urban areas
- **CRITICAL: SYNCHRONIZE ALL TIMES PERFECTLY**
  * Transportation arrival time = Activity/Meal start time
  * Activity/Meal end time = Next transportation departure time
  * Example: Morning activity 9:00 AM - 11:00 AM → Lunch transport departs 11:00 AM → Lunch 11:15 AM - 12:30 PM
- Weather-appropriate activities (e.g., avoid rain-prone times outdoors)
- Use realistic durations (e.g., 30 mins walk, 2 hrs by bus)
- Use realistic cost estimates for each transport type
- Multiple options for meals and hotels when possible
- Return ONLY a properly formatted valid JSON
- Use image URLs in format: /trip-images/[name].jpg based on item name
- The daily_itinerary array MUST contain exactly {day_count} days (from day 1 to day {day_count})
## TIME SYNCHRONIZATION RULES:
1. Day starts: 8:30 AM (hotel departure)
2. Morning Activity: 9:00 AM - 11:00 AM (2 hours)
3. Transport to Lunch: 11:00 AM - 11:15 AM (15 mins)
4. Lunch: 11:15 AM - 12:30 PM (1.25 hours)
5. Transport to Afternoon: 12:30 PM - 1:00 PM (30 mins)
6. Afternoon Activities: 1:00 PM - 5:00 PM (4 hours)
7. Transport to Dinner: 5:00 PM - 5:30 PM (30 mins)
8. Dinner: 5:30 PM - 7:00 PM (1.5 hours)
9. Transport to Hotel: 7:00 PM - 7:30 PM (30 mins)
10. Hotel Check-in: 7:30 PM

Available images: jaflong.jpg, ratargul.jpg, lalakhal.jpg, sajek_valley.jpg, kaptai_lake.jpg, hanging_bridge.jpg, rajban_vihara.jpg, shahjalal_dargah.jpg, hotel_metro.jpg, garden_inn.jpg, sajek_resort.jpg, lalakhal_resort.jpg, paharika_inn.jpg, hotel_swamp_view.jpg, tribal_food.jpg, valley_cafe.jpg, woondal.jpg, blue_water.jpg, star_pacific.jpg, vihara_view.jpg, kutum_bari.jpg
- Return ONLY valid JSON"""

    try:
        # Call Gemini API with increased token limit for comprehensive plans
        print("🤖 Calling Gemini API...")
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=8192,  # Increased from 4096 to handle more complex plans
                response_mime_type="application/json"
            )
        )
        
        llm_response = response.text
        
        # Print the LLM response for debugging
        print("🎯 LLM Response:")
        print("=" * 80)
        print(llm_response)
        print("=" * 80)
        
        return llm_response
        
    except Exception as e:
        print(f"❌ Error generating trip plan: {str(e)}")
        # Return a fallback JSON structure
        fallback_plan = {
            "trip_summary": {
                "origin": origin,
                "destination": destination,
                "start_date": start_date,
                "duration": day_count,
                "total_budget": budget,
                "error": "Failed to generate detailed plan"
            },
            "daily_itinerary": [],
            "total_budget_summary": {
                "grand_total": 0,
                "budget_remaining": budget,
                "error": f"Plan generation failed: {str(e)}"
            }
        }
        return json.dumps(fallback_plan, indent=2)

def get_image_url(item_name, item_type="spot"):
    """
    Extract filename from AI response URL or generate from name
    This function now works with the dynamic approach
    
    Args:
        item_name (str): Name of the spot, hotel, or restaurant, or full URL
        item_type (str): Type - 'spot', 'hotel', or 'restaurant'
    
    Returns:
        str: Image URL path or None if no valid image
    """
    if not item_name:
        # Return None instead of default - let frontend handle text fallback
        return None
    
    # If it's already a URL, extract the filename
    if item_name.startswith('http'):
        try:
            filename = item_name.split('/')[-1]
            
            # Clean up the filename - remove any prefixes like 'trip_images'
            if filename.startswith('trip_images'):
                filename = filename.replace('trip_images', '', 1)
            
            # Ensure it has an extension
            if '.' not in filename:
                filename += '.jpg'
                
            # Ensure filename doesn't start with underscore
            filename = filename.lstrip('_')
            
            return "/trip-images/" + filename
        except:
            return None
    
    # If it's already a processed URL path, just return it
    if item_name.startswith('/trip-images/'):
        return item_name
    
    # If it's just a name, create a filename
    # Convert to lowercase, replace spaces with underscores
    filename = item_name.lower().replace(' ', '_').replace('-', '_')
    filename = ''.join(c for c in filename if c.isalnum() or c in ['_', '.'])
    
    # Add .jpg extension if not present
    if not filename.endswith(('.jpg', '.jpeg', '.png', '.webp')):
        filename += '.jpg'
        
    return "/trip-images/" + filename

def customize_trip_plan(original_plan, user_prompt):
    """
    Customize an existing trip plan based on user's modification request using Gemini LLM.
    
    Args:
        original_plan (dict): The original trip plan JSON containing all needed data
        user_prompt (str): User's customization request
        
    Returns:
        str: Customized trip plan from the LLM
    """
    
    try:
        # Check if Gemini API key is available
        if not gemini_api_key:
            print("❌ GEMINI_API_KEY not found in environment variables")
            raise Exception("Gemini API key not configured")
        
        print(f"🔧 CUSTOMIZE DEBUG INFO:")
        print(f"   Original plan type: {type(original_plan)}")
        print(f"   Original plan keys: {list(original_plan.keys()) if isinstance(original_plan, dict) else 'Not a dict'}")
        print(f"   User prompt: {user_prompt}")
        print(f"   Gemini model initialized: {model is not None}")
        
        # Convert original plan to string for the prompt
        original_plan_str = json.dumps(original_plan, indent=2, ensure_ascii=False)
        print(f"   Original plan JSON length: {len(original_plan_str)} characters")
        
        # Create a focused and intelligent prompt for trip customization
        prompt = f"""You are an expert travel planner specializing in trip customization. A user has an existing complete trip plan and wants to make specific modifications to it.

## Original Complete Trip Plan:
{original_plan_str}

## User's Modification Request:
"{user_prompt}"

## Your Task:
Intelligently modify the original trip plan according to the user's request. The original plan contains all the necessary data about available spots, hotels, restaurants, weather, and budget information.

## Customization Guidelines:

### Core Principles:
1. **Preserve Structure**: Keep the exact same JSON structure as the original plan
2. **Smart Changes**: Only modify what the user specifically requested
3. **Use Original Data**: Use spots, hotels, restaurants from the original plan's data
4. **Budget Awareness**: Stay within the original budget constraints
5. **Logical Consistency**: Ensure changes make practical sense

### Required Output Format:
Return a complete JSON trip plan with the EXACT same structure as the original plan.

### Image URLs: 
Use format: "/trip-images/[descriptive_name].jpg" for all activities

### Key Points:
- Maintain all required fields from original structure
- Be creative but realistic with changes
- Ensure modified plan is immediately usable
- Keep explanations within activity descriptions
- Update trip_theme and highlights if relevant

Now customize the trip plan based on the user's request:

Return ONLY the modified trip plan as valid JSON without any explanations or markdown formatting."""

        # Call Gemini API
        print("🤖 Calling Gemini API for trip customization...")
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=8192,
                response_mime_type="application/json"
            )
        )
        
        llm_response = response.text
        
        # Print the LLM response for debugging
        print("🎯 Customization LLM Response:")
        print("=" * 80)
        print(llm_response)
        print("=" * 80)
        
        return llm_response
        
    except Exception as e:
        print(f"❌ Error customizing trip plan: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"❌ Error details: {e}")
        
        # Return a fallback response
        fallback_response = {
            "error": "Failed to customize trip plan",
            "error_type": type(e).__name__,
            "error_details": str(e),
            "original_plan": original_plan,
            "user_request": user_prompt,
            "message": "Please try again with a different request or check system configuration"
        }
        return json.dumps(fallback_response, indent=2)

def generate_gemini_suggestion(prompt):
    """
    Use Gemini to generate a weather-based suggestion from a prompt.
    """
    load_dotenv()
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text.strip() if hasattr(response, 'text') else str(response)