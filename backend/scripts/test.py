import requests
from bs4 import BeautifulSoup
import re

url = "https://www.mypetrolprice.com/53/Fuel-prices-in-Vadodara"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
res = requests.get(url, headers=headers)

matches = re.findall(r'₹\s*(\d{2,3}\.\d{2})', res.text)
print("ALL PRICES IN RAW HTML:", matches[:10])

soup = BeautifulSoup(res.text, 'html.parser')
for b in soup.find_all('b'):
    if '₹' in b.get_text():
        print(b.get_text())
        
for div in soup.find_all('div', class_='txtC'):
    text = div.get_text(strip=True).encode('ascii', 'ignore').decode()
    print("TXTC DIV:", text)
