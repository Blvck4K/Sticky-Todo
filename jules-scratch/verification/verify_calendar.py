from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.wait_for_selector(".grid.grid-cols-1.lg\\:grid-cols-3")
    page.screenshot(path="jules-scratch/verification/calendar_view.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
