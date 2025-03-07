import pandas as pd
from fuzzywuzzy import process, fuzz

# Load contacts from CSV file


def load_contacts(filepath):
    df = pd.read_csv(filepath, delimiter=',',
                     quotechar='"', on_bad_lines='skip', header=None)
    df.columns = ['name', 'phone']
    return df

# Perform fuzzy search


def search_contacts(query, contacts_df):
    threshold = 80  # Set the score threshold

    # Exact or substring matches (added .copy() to avoid SettingWithCopyWarning)
    exact_matches = contacts_df[contacts_df['name'].str.contains(
        query, case=False)].copy()

    # Fuzzy matching on remaining contacts
    remaining_contacts = contacts_df[~contacts_df['name'].str.contains(
        query, case=False)]
    fuzzy_results = process.extract(
        query, remaining_contacts['name'].tolist(), limit=5, scorer=fuzz.token_set_ratio)

    # Combine results
    fuzzy_matches = []
    for contact, score in fuzzy_results:
        if score >= threshold:  # Filter based on threshold
            idx = contacts_df[contacts_df['name'] == contact].index[0]
            fuzzy_matches.append((contacts_df.iloc[idx], score))

    # Sort exact matches by length of name (shorter names first)
    exact_matches['length'] = exact_matches['name'].str.len()
    exact_matches = exact_matches.sort_values(by='length')

    # Combine and sort all results
    results = []
    for _, row in exact_matches.iterrows():
        results.append((row, 100))  # Assign score of 100 to exact matches

    results.extend(fuzzy_matches)

    results = sorted(results, key=lambda x: x[1], reverse=True)[:5]

    return results

# New function to get phone number by name


def get_phone_by_name(name):
    contacts_df = load_contacts('./contacts.csv')
    results = search_contacts(name, contacts_df)
    if results:
        return results[0][0]['phone']
    else:
        return None


def main():
    filepath = './contacts.csv'
    contacts_df = load_contacts(filepath)
    # print(contacts_df)
    query = input("Enter contact name to search: ")
    # print("Hello")

    results = search_contacts(query, contacts_df)
    # print(results)
    for contact, score in results:
        print(
            f"Name: {contact['name']}, Phone: {contact['phone']}, Score: {score}")


if __name__ == "__main__":
    main()
    get_phone_by_name("Prasham")
