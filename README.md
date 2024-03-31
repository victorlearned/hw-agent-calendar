# hw-agent-calendar


Assumptions:

An agent can only have 1 associated calendar
Only allowing for google calendar integrations
Only allow meetings of 30 or 1 hour time duratoins
Limit search to the next 2 weeks
Capping Set of Agents to 20 (unsure exact use case for this in larger scenarios but makes sense for buyer : seller agents to connect)
All dates returned as UTC and consumer is responsible for handling timezone conversion


do I want to care about caching?
    * this only makes sense if I get webhooks going
      and have it invalidated in real time as things change

do I want a cron job to pull in data based on some kind of sliding window?
    * would limit the pulling required and then and I can cache a lot of it
    * then cache and set ttl for when it naturally falls off/time hits
    * rely on webhooks to invalidate


steps:

Create a mockGoogle calendar api to use in the googleCalendarService so
I can mimic async calls and more easily return data or test getting a JWT/Google auth working

Update the googleCalendarService to do the logic


Going with freebusy even though it doesn't support pagination it's typically less metadata
so hopefully data will be drastically less. Also capping 2 weeks out and