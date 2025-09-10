import requests
from typing import Dict, Any

BASE_URL = "https://bubbly.linuskang.au/api"

def get_reviews(bubbler_ids: list[int]) -> Dict[str, Any]:
    results = []
    for bubbler_id in bubbler_ids:
        url = f"{BASE_URL}/reviews?bubblerId={bubbler_id}"
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
        url = f"{BASE_URL}/waypoints?bubblerId={bubbler_id}"
        response = requests.get(url, verify=False)
        if response.status_code == 200:
            data = response.json()
            results.append({"bubblerId": bubbler_id, "information": data})
        else:
            results.append({"bubblerId": bubbler_id, "error": f"Failed (status {response.status_code})"})
    return {"results": results}



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