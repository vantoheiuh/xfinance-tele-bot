import asyncio
from twscrape import API, gather
from twscrape.logger import set_log_level
import json
from datetime import date, datetime
import requests
import time
import sys



async def main():
    api = API()  # or API("path-to.db") - default is `accounts.db`

    #TL3wiWClCTIsR3kJAN4w1BgTlsdCj1U2YAKtRk
    b = await gather(api.user_tweets(sys.argv[1], limit=int(sys.argv[4])))
    with open(sys.argv[3],'w') as file:
        for x in b:
            file.write(x.json() + '\n')
    
        

    #     while account := file.readline():
    #         # The API endpoint
    #         url = "http://proxy.tinsoftsv.com/api/changeProxy.php?key=TL3wiWClCTIsR3kJAN4w1BgTlsdCj1U2YAKtRk&location=0"
    #         # A GET request to the API
    #         response = requests.get(url)
    #         # Print the response
    #         response_json = response.json()
    #         print(response_json)
    #         proxy = "http://" + response_json["proxy"]
    #         accountArr = account.split("|")
    #         print(accountArr)
    #         await api.pool.add_account(accountArr[0], accountArr[1], accountArr[2], accountArr[3], proxy=proxy)
    #         await api.pool.login_all()
    #         time.sleep(125)

    # ADD ACCOUNTS (for CLI usage see BELOW)
    # await api.pool.add_account("user1", "pass1", "u1@example.com", "mail_pass1")
    # await api.pool.add_account("user2", "pass2", "u2@example.com", "mail_pass2")
    # await api.pool.login_all()



if __name__ == "__main__":
    asyncio.run(main())