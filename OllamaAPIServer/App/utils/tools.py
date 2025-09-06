import requests
from typing import Dict, Any

BASE_URL = "https://bubbly.lkang.au/api"

def get_reviews(bubbler_ids: list[int]) -> Dict[str, Any]:
    results = []
    for bubbler_id in bubbler_ids:
        url = f"https://bubbly.lkang.au/api/reviews?bubblerId={bubbler_id}"
        response = requests.get(url, verify=False)
        if response.status_code == 200:
            data = response.json()
            results.append({"bubblerId": bubbler_id, "reviews": data})
        else:
            results.append({"bubblerId": bubbler_id, "error": f"Failed (status {response.status_code})"})
    return {"results": results}

def get_info(bubbler_ids: list[int]) -> Dict[str, Any]:
    results = []
    for bubbler_id in bubbler_ids:
        url = f"https://bubbly.lkang.au/api/waypoints?bubblerId={bubbler_id}"
        response = requests.get(url, verify=False)
        if response.status_code == 200:
            data = response.json()
            results.append({"bubblerId": bubbler_id, "information": data})
        else:
            results.append({"bubblerId": bubbler_id, "error": f"Failed (status {response.status_code})"})
    return {"results": results}

def get_top_bottom_bubblers(suburb: str) -> Dict[str, Any]:
    url = f"https://bubbly.lkang.au/api/waypoints?suburb={suburb}"
    response = requests.get(url, verify=False)
    if response.status_code != 200:
        return {"error": f"Failed to fetch bubblers for {suburb} (status {response.status_code})"}
    bubblers = response.json()

    results = []
    for b in bubblers:
        bubbler_id = b["id"]
        r = requests.get(f"https://bubbly.lkang.au/api/reviews?bubblerId={bubbler_id}", verify=False)
        if r.status_code == 200:
            reviews = r.json()
            if reviews:
                avg_rating = sum([rev["rating"] for rev in reviews]) / len(reviews)
            else:
                avg_rating = None
            results.append({
                "bubblerId": bubbler_id,
                "location": b.get("name", "Unknown"),
                "avg_rating": avg_rating,
                "review_count": len(reviews),
            })

    rated = [r for r in results if r["avg_rating"] is not None]
    if not rated:
        return {"error": f"No rated bubblers found in {suburb}"}

    highest = max(rated, key=lambda x: x["avg_rating"])
    lowest = min(rated, key=lambda x: x["avg_rating"])

    return {
        "suburb": suburb,
        "highest": highest,
        "lowest": lowest,
    }

get_reviews_tool = {
    'type': 'function',
    'function': {
        'name': 'get_reviews',
        'description': 'Fetch reviews for one or more bubbler IDs from the Bubbly API.',
        'parameters': {
            'type': 'object',
            'required': ['bubbler_ids'],
            'properties': {
                'bubbler_ids': {
                    'type': 'array',
                    'items': {'type': 'integer'},
                    'description': 'List of bubbler IDs to fetch reviews for.'
                }
            },
        },
    },
}

get_information_tool = {
    'type': 'function',
    'function': {
        'name': 'get_info',
        'description': 'Fetch details for one or more bubbler IDs from the Bubbly API.',
        'parameters': {
            'type': 'object',
            'required': ['bubbler_ids'],
            'properties': {
                'bubbler_ids': {
                    'type': 'array',
                    'items': {'type': 'integer'},
                    'description': 'List of bubbler IDs to fetch information for.'
                }
            },
        },
    },
}

get_top_bottom_tool = {
    'type': 'function',
    'function': {
        'name': 'get_top_bottom_bubblers',
        'description': 'Find the highest and lowest rated bubblers in a suburb.',
        'parameters': {
            'type': 'object',
            'required': ['suburb'],
            'properties': {
                'suburb': {
                    'type': 'string',
                    'description': 'The suburb to search in, e.g. "Calamvale".'
                }
            },
        },
    },
}