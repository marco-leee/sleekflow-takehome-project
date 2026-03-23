# Tech Stack

[← Back to documentation index](main.md)

## Frontend

1. React
   1. Most popular frontend framework in the market.
   2. Very mature, stable and large community support.
   3. Many apps are built with React
   4. Large ecosystem of libraries and tools.
   5. Most developers are familiar with React.
   6. Since the app is a SPA, React router is a better option than NextJS.
   7. Framework
      1. NextJS: best for SEO and performance.
      2. React router: lighter weight option  
2. Svelte
   1. Good for large amount of data and complex UI.
   2. Still in its early stages of development but maturing
   3. For large scale enterprise application, react is a better option than Svelte.

Final decision: React with react router

## Backend

Given the server is required to handle 20M+ requests per hour, the system should be able to handle the load.

Requirements

1. Must be easily scalable and deployable.
2. Easy to develop and maintain.
3. Cost efficient
4. Well documented and supported by the open source community

Options

2. Full stack framework
   1. In real world large scale application, not recommended since it is not efficient and scalable.
   2. Would take up a lot of resources, driving up the cost.
3. Dedicated backend
   1. NodeJS
   2. Python
      1. Pro
         1. Fast to develop
         2. Large community and ecosystem.
         3. Easy to understand and use.
      2. Con
         1. High level programming language not recommended for this scale of application. As some point, the performance will be a problem.
         2. Resource intensive: memory allocation, garbage collection, thread operations are abstracted away, not easily tunable.
         3. Not as performant as other options, will take a hit when load is high due to the language itself.
         4. Hortizonal scaling will be slower compared to other options due to container size and their dependencies.
   3. Golang
      1. Pros
         1. Lightweight, compiled language
         2. Simple, easy syntax
         3. Great standard libraries out of the box, less dependencies, less surface attack vector.
      2. Cons
         1. 
   4. Rust
      1. Pro
         1. Very performant
         2. Memory safe
         3. Can easily handle the load of request mentioned above.
      2. Cons
         1. Learning curve
         2. Overkill for todo list app.
         3. Much slower to build
   5. Other options
      1. Java / Kotlin
         1. Good for large scale enterprise application.
         2. Mature
         3. Runs on JVM, which can be slower to scale
         4. Since running on JVM, it's isolated, provied security.

For real project: Golang

1. 

For demo purpopse: React router with SSR

1. Less time to develop
2. Easier to operate

## Database
