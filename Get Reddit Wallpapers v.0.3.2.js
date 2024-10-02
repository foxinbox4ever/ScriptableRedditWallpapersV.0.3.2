// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: grin-beam;
const redditUrls = [
    "https://www.reddit.com/r/wallpapers/new.json?limit=5",
    "https://www.reddit.com/r/WallpaperRequests/new.json?limit=5",
    "https://www.reddit.com/r/wallpaperspro/new.json?limit=5",
    "https://www.reddit.com/r/AestheticWallpapers/new.json?limit=5",
    //Add Wallpaper reddit URLs here
];

async function fetchRedditPosts(url) {
    const req = new Request(url);
    
    try {
        const res = await req.loadJSON();

        // Safely access nested properties using optional chaining
        const posts = res?.data?.children;

        if (Array.isArray(posts) && posts.length > 0) {
            return posts;  // Return the posts directly if available
        } else {
            console.warn(`No posts found at ${url}`);
            return [];  // Return an empty array if no posts found
        }
    } catch (error) {
        // Log a more specific error message
        console.error(`Error fetching posts from ${url}: ${error.message || error}`);
        return [];  // Return an empty array on error
    }
}

function findMostRecentImagePost(posts) {
    let latestCreationTime = 0;
    let selectedPost = null;

    // Function to check for phone-related content
    const isPhoneContent = (title, url) => {
        const keywords = ["phone", "iphone", "android", "screenshot", "edit"];
        const titleLower = title.toLowerCase();
        const urlLower = url ? url.toLowerCase() : '';  // Ensure URL is not undefined

        return keywords.some(keyword => titleLower.includes(keyword) || urlLower.includes(keyword));
    };

    // Loop through each post and filter out invalid content
    for (const post of posts) {
        const postData = post.data;

        // Ensure url_overridden_by_dest exists before performing operations
        if (
            postData.url_overridden_by_dest &&
            /\.(jpg|jpeg|png|gif|bmp)$/i.test(postData.url_overridden_by_dest) &&
            !postData.url_overridden_by_dest.includes("/gallery/") &&
            !isPhoneContent(postData.title, postData.url_overridden_by_dest)
        ) {
            const creationTime = postData.created_utc;

            // Update selectedPost if this post is more recent
            if (creationTime > latestCreationTime) {
                selectedPost = postData;
                latestCreationTime = creationTime;
            }
        } else {
            // Log why the post was skipped
            if (postData.url_overridden_by_dest && postData.url_overridden_by_dest.includes("/gallery/")) {
                console.log("Skipped gallery link: " + postData.url_overridden_by_dest);
            } else if (isPhoneContent(postData.title, postData.url_overridden_by_dest)) {
                console.log("Skipped phone-related content: " + postData.url_overridden_by_dest);
            } else if (postData.url_overridden_by_dest && !/\.(jpg|jpeg|png|gif|bmp)$/i.test(postData.url_overridden_by_dest)) {
                console.log("Skipped non-image URL: " + postData.url_overridden_by_dest);
            } else {
                console.log("Skipped post with missing or invalid URL");
            }
        }
    }

    // Return the image URL and the selected post
    if (!selectedPost) {
        throw new Error("No valid image posts found.");
    }

    return { imageUrl: selectedPost.url_overridden_by_dest, selectedPost };
}

async function fetchImage(redditUrls) {
    try {
        // Fetch posts concurrently using Promise.all
        const allFetchedPosts = (await Promise.all(redditUrls.map(fetchRedditPosts))).flat();
        
        // Check if any posts were fetched
        if (allFetchedPosts.length === 0) {
            throw new Error("No valid data found in the Reddit API responses.");
        }

        // Find the most recent image post
        const { imageUrl, selectedPost } = findMostRecentImagePost(allFetchedPosts);

        if (!imageUrl) {
            throw new Error("No post with an image found in the fetched posts.");
        }

        // Log and save the selected image
        console.log("Selected Image: " + imageUrl);
        return await saveImage(imageUrl);

    } catch (error) {
        // Log the error in a consolidated manner
        console.error(`Error fetching image: ${error.message}`);
        return null;
    }
}

async function saveImage(imageUrl, fileName = 'wallpaper.jpg') {
    console.log("Attempting to save the image to local files");

    // Validate the imageUrl
    if (!imageUrl || typeof imageUrl !== 'string') {
        console.error("Invalid image URL provided.");
        return null;  // Return null if the URL is invalid
    }

    try {
        const reqImage = new Request(imageUrl);
        const img = await reqImage.loadImage();

        // Check if img is valid
        if (!img) {
            console.error("Failed to load image from the provided URL.");
            return null;  // Return null if image loading fails
        }

        const fm = FileManager.local();
        const dir = fm.documentsDirectory();
        const path = fm.joinPath(dir, fileName);

        // Write the image to the specified path
        fm.writeImage(path, img);
        console.log("Image has been saved to: " + path);
        return path;
    } catch (error) {
        console.error(`Error saving image: ${error.message || error}`);
        return null;  // Return null on error
    }
}

async function main() {
    console.log("Changing the wallpaper");
    const imgPath = await fetchImage(redditUrls);
    if (imgPath) {
        console.log("Image is waiting to be sent")
        return imgPath;
        
    } else {
        console.error("Failed to get image URL.");
    }
}

// Call the main function to fetch and save the image
return await main();
Script.complete();