# Satu Framework - NextJs

This Project was generated with NextJs version 14.2.13 and NodeJs version 20.9

## Contributor

- Muhammad Hilmy Aziz (Frontend Development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://teamgit.telkomuniversity.ac.id/satu/satu-next-template.git
   ```

2. Navigate to the project directory:

   ```bash
   cd template-satu-next
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

to install dependencies temporarily only support using npm

4. Set environment variables in `.env.local` (API URL, etc.):

### Running the Project

To start the development server, run:

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3001`.

### Building for Production

To build the app for production, run:

```bash
npm run build
# or
yarn build
```

This will create an optimized build in the `.next` folder.

To run the production build:

```bash
npm run start
# or
yarn start
```

## API Setup

1. **Axios Configuration:**

   - `axios.ts` in `src/utils`: Configures Axios for client-side requests.

2. **Endpoints:**

   - All API endpoints are stored in `src/data/endpoints.ts`.

3. **Data Fetching:**
   - All data fetching functions should be created in `src/utils/data.ts`.

## Testing

Playwright is used for end-to-end testing. The tests are located in the `tests/` folder.

To run the tests:

```bash
npm run test
# or
yarn test
```

## Styling

The project uses Tailwind CSS for styling. Tailwind is pre-configured in the project for quick development.

### Customization:

You can customize Tailwind in the `tailwind.config.js` file located at the project root.

## Localization

The project supports multiple languages through a `locales` folder in `src/utils`. You can add vocabulary for different languages here.

## Notes:

- **API Temporary:** OBE Student API (https://stg-service-satu.telkomuniversity.ac.id/system-information-academic-obe-students/)
- **Axios Configuration:**
  - Set up axios.ts in `src/utils`
- **Endpoints:** Store all API endpoints in `src/data/endpoints.ts`
- **Data Fetching:** Implement all data fetching logic in `src/utils/data.ts`
- **Folder Structure:** Ensure it defines the routing path for each page and component.
- **Configuration:** Store web configuration settings in `config.ts` in the `src` folder.
- **Language Support:** Store vocabulary for different languages in the `locales` folder in `src/utils`.
- **Tailwind CSS:** Ensure Tailwind CSS is set up and configured.
- **Testing:** Playwright testing is configured in the `test` folder.
- **Theme Configuration:** Browser theme configuration is stored in `localStorage`.
- **Environment Variables:** Store variables in `.env.local` for production, not in `next.config.js`.

## License

This project is licensed under the MIT License.
