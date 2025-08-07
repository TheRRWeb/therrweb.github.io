// netlify/functions/subscribe.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
    // Only accept POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 200, body: "Subscribe endpoint. Send a POST." };
    }

    try {
        const { email, fullName } = JSON.parse(event.body);
        const parts = fullName.trim().split(/\s+/);
        const FNAME = parts[0];
        const LNAME = parts.length > 1 ? parts[parts.length - 1] : "";

        // Your Mailchimp credentials
        const API_KEY = "5046bd3f3ba5d4269e6bed3d46cf48b7-us10";
        const LIST_ID = "10bb880c3c";
        const DC      = "us10";

        const url = `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": `apikey ${API_KEY}`
            },
            body: JSON.stringify({
                email_address: email,
                status:        "subscribed",
                merge_fields:  { FNAME, LNAME, DOB: "" }
            })
        });

        const text = await resp.text();
        return {
            statusCode: resp.status,
            body:       text
        };
    } catch (err) {
        return {
            statusCode: 500,
            body:       JSON.stringify({ error: err.message })
        };
    }
};