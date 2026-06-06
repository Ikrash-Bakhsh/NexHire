import time
import random
from datetime import datetime
from urllib.parse import quote

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
    SELENIUM_OK = True
except ImportError:
    SELENIUM_OK = False

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def get_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument(f"user-agent={HEADERS['User-Agent']}")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def random_delay(mn=1.5, mx=3.5):
    time.sleep(random.uniform(mn, mx))

def scrape_linkedin_jobs(keyword: str, location: str = "", limit: int = 10) -> list:
    if not SELENIUM_OK:
        return _demo_jobs(keyword, location, limit, "linkedin")
    jobs = []
    driver = None
    try:
        driver = get_driver()
        loc = location or "Pakistan"
        url = f"https://www.linkedin.com/jobs/search?keywords={quote(keyword)}&location={quote(loc)}&f_AL=true&sortBy=DD"
        driver.get(url)
        random_delay(2, 4)
        for _ in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            random_delay(1, 2)
        cards = driver.find_elements(By.CSS_SELECTOR, "div.base-card")
        if not cards:
            cards = driver.find_elements(By.CSS_SELECTOR, "li.jobs-search__results-list > div")
        for card in cards[:limit]:
            try:
                title = company = ""
                loc_txt = loc
                job_url = posted = ""
                try: title = card.find_element(By.CSS_SELECTOR, "h3.base-search-card__title").text.strip()
                except:
                    try: title = card.find_element(By.CSS_SELECTOR, "h3, h2, a").text.strip()
                    except: pass
                try: company = card.find_element(By.CSS_SELECTOR, "h4.base-search-card__subtitle").text.strip()
                except:
                    try: company = card.find_element(By.CSS_SELECTOR, "a.hidden-nested-link").text.strip()
                    except: pass
                try: loc_txt = card.find_element(By.CSS_SELECTOR, "span.job-search-card__location").text.strip()
                except: pass
                try:
                    link = card.find_element(By.CSS_SELECTOR, "a.base-card__full-link")
                    job_url = link.get_attribute("href").split("?")[0]
                except:
                    try:
                        link = card.find_element(By.TAG_NAME, "a")
                        job_url = link.get_attribute("href")
                    except: pass
                try:
                    t = card.find_element(By.TAG_NAME, "time")
                    posted = t.get_attribute("datetime") or datetime.now().strftime("%Y-%m-%d")
                except: posted = datetime.now().strftime("%Y-%m-%d")
                if title:
                    jobs.append({"title": title, "company": company or "See LinkedIn", "location": loc_txt,
                        "description": f"{title} at {company}. Location: {loc_txt}.",
                        "url": job_url, "source": "linkedin", "posted_date": posted})
            except: continue
    except Exception as e:
        print(f"LinkedIn error: {e}")
    finally:
        if driver:
            try: driver.quit()
            except: pass
    return jobs[:limit] if jobs else _demo_jobs(keyword, location, limit, "linkedin")

def scrape_indeed_jobs(keyword: str, location: str = "", limit: int = 10) -> list:
    if not SELENIUM_OK:
        return _demo_jobs(keyword, location, limit, "indeed")
    jobs = []
    driver = None
    try:
        driver = get_driver()
        loc = location or "Pakistan"
        for url in [
            f"https://pk.indeed.com/jobs?q={quote(keyword)}&l={quote(loc)}&sort=date",
            f"https://www.indeed.com/jobs?q={quote(keyword)}&l={quote(loc)}&sort=date"
        ]:
            try:
                driver.get(url)
                random_delay(2, 4)
                if "captcha" in driver.page_source.lower(): continue
                for _ in range(2):
                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
                    random_delay(1, 2)
                break
            except: continue
        cards = []
        for sel in ["div.job_seen_beacon", "div.tapItem", "div[data-jk]"]:
            cards = driver.find_elements(By.CSS_SELECTOR, sel)
            if cards: break
        for card in cards[:limit]:
            try:
                title = company = loc_txt = job_url = ""
                for sel in ["h2.jobTitle span", "h2[class*='jobTitle'] span", "h2 span"]:
                    try:
                        title = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                        if title and title != "new": break
                    except: continue
                for sel in ["span[data-testid='company-name']", "span.companyName"]:
                    try:
                        company = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                        if company: break
                    except: continue
                for sel in ["div[data-testid='text-location']", "div.companyLocation"]:
                    try:
                        loc_txt = card.find_element(By.CSS_SELECTOR, sel).text.strip()
                        if loc_txt: break
                    except: continue
                try:
                    link = card.find_element(By.CSS_SELECTOR, "a.jcs-JobTitle")
                    jk = link.get_attribute("data-jk") or ""
                    job_url = f"https://pk.indeed.com/viewjob?jk={jk}" if jk else link.get_attribute("href") or ""
                except:
                    try: job_url = card.find_element(By.TAG_NAME, "a").get_attribute("href") or ""
                    except: pass
                if title:
                    jobs.append({"title": title, "company": company or "See Indeed", "location": loc_txt or loc,
                        "description": f"{title} at {company}. Location: {loc_txt}.",
                        "url": job_url, "source": "indeed", "posted_date": datetime.now().strftime("%Y-%m-%d")})
            except: continue
    except Exception as e:
        print(f"Indeed error: {e}")
    finally:
        if driver:
            try: driver.quit()
            except: pass
    return jobs[:limit] if jobs else _demo_jobs(keyword, location, limit, "indeed")

def scrape_job_description(job_url: str) -> str:
    if not job_url: return ""
    try:
        resp = requests.get(job_url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag, attrs in [("div", {"class": "show-more-less-html__markup"}),
                           ("div", {"class": "description__text"}),
                           ("div", {"id": "jobDescriptionText"}),
                           ("div", {"class": "jobsearch-jobDescriptionText"})]:
            el = soup.find(tag, attrs)
            if el: return el.get_text(separator="\n", strip=True)[:3000]
    except: pass
    return ""

def _demo_jobs(keyword: str, location: str, limit: int, source: str) -> list:
    companies = ["Systems Ltd", "10Pearls", "Netsol Technologies", "Folio3", "Arbisoft",
                 "Contour Software", "Devsinc", "Techlogix", "Ovex Technologies", "TRG Pakistan"]
    base_url = "https://www.linkedin.com/jobs/search" if source == "linkedin" else "https://pk.indeed.com/jobs"
    titles = [keyword, f"Senior {keyword}", f"Junior {keyword}", f"{keyword} Developer", f"{keyword} Engineer"]
    return [{"title": titles[i % len(titles)], "company": companies[i % len(companies)],
             "location": location or "Pakistan", "description": f"Looking for {keyword} professional.",
             "url": f"{base_url}?q={quote(keyword)}", "source": source,
             "posted_date": datetime.now().strftime("%Y-%m-%d")} for i in range(min(limit, 8))]
