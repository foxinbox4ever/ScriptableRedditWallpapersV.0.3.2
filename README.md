Get Reddit Wallpapers v.0.3.2
by foxinbox

This is a JS script intended to be run on the IOS Scriptable app. This script gets you the latest wallpapers from various wallpaper subreddits, the output can be used by the IOS Shorcuts app as a file. 

How to use on iPhone
- Download the Scriptable app
- Download the JS file
- Go to the JS file in the files app
- Press the share button and share to Scriptable
- Press Add to My Scripts
- Go to the Shortcuts app
- Create a new shortcut
- Search for the action Run Script and place it in the shortcut
- Change the script you run to the one you just downloaded
- Search File and put the output through the File action
- Search Set Wallpaper and select the wallpaper you want to change
- Click the arrow and turn off Show Preview

How to add/change the subreddits the wallpapers are from
- Copy the link of the subreddit you wish to add
- At the very top of the JS script you will see the array RedditUrls
- Add the reddit URL between "" and add a comma at the end (if you want to add more)
- Then add /new.json?limit=5 to the end of the reddit URL
- Please keep in mind reddit API T&C https://redditinc.com/policies/data-api-terms
- Make sure the array looks like this e.g const redditUrls = ["https://www.reddit.com/r/subRedditName/new.json?limit=5",]
