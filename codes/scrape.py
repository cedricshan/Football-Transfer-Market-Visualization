import requests
import bs4
import pandas as pd
import numpy as np

headers = {'User-Agent':
           'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'}

meta = pd.read_csv('league-meta.csv')

for j in range(6,len(meta)):
    league_table = pd.DataFrame()
    print(meta['league_name'][j])
    for season in range(1994,2024):
        URL = "https://www.transfermarkt.com/" + meta['league_name'][j] + "/transfers/wettbewerb/" + \
            meta['league_id'][j] + "/plus/?saison_id=" + \
            str(season) + "&s_w=&leihe=3&intern=0"

        response = requests.get(URL, headers=headers)
        soup = bs4.BeautifulSoup(response.content, 'html.parser')

        club = [i.text[1:-1]
                for i in soup.find_all('h2', attrs={'class': 'content-box-headline--logo'})]
        club_inv = [i.text if i.find('a') is None else i.find('a')['title']
                    for i in soup.find_all('td', attrs={'class': 'no-border-links verein-flagge-transfer-cell'})]
        players = [i.find('a')['title'] for i in soup.find_all('span', attrs={'class': 'hide-for-small'})]

        tables = pd.read_html(response.text)

        tot_table = pd.DataFrame()
        prev = 0
        for i in range(1, len(tables)):
            if len(tables[i]) == 0 or isinstance(tables[i]['Age'][0], str):
                continue
            tables[i]['Club'] = club[(i-1)//2]
            tables[i]['Club Involved'] = club_inv[prev:prev+len(tables[i])]
            tables[i]['Player'] = players[prev:prev+len(tables[i])]
            tables[i]['Year'] = season
            tables[i]['Transfer Movement'] = 'In' if i % 2 == 1 else 'Out'
            tables[i]['League Name'] = meta['league_name'][j]
            prev += len(tables[i])
            tot_table = pd.concat([tot_table,
                                   tables[i][['Club', 'Player', 'Age', 'Pos', 'Club Involved', 'Fee', 'Transfer Movement', 'League Name', 'Year']]])
        league_table = pd.concat([league_table,tot_table])
        print(season)
    
    league_table.to_csv('data/' + meta['league_name'][j] + '.csv',index=False)