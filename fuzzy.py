import pandas as pd
from fuzzywuzzy import process, fuzz




def load_contacts(filepath):
    df = pd.read_csv(filepath, delimiter=',',
                     quotechar='"', on_bad_lines='skip', header=None)
    df.columns = ['name', 'phone']
    return df



def search_contacts(query, contacts_df):
    threshold = 80  

    exact_matches = contacts_df[contacts_df['name'].str.contains(
        query, case=False)].copy()

    remaining_contacts = contacts_df[~contacts_df['name'].str.contains(
        query, case=False)]
    fuzzy_results = process.extract(
        query, remaining_contacts['name'].tolist(), limit=5, scorer=fuzz.token_set_ratio)

    fuzzy_matches = []
    for contact, score in fuzzy_results:
        if score >= threshold:  
            idx = contacts_df[contacts_df['name'] == contact].index[0]
            fuzzy_matches.append((contacts_df.iloc[idx], score))

    exact_matches['length'] = exact_matches['name'].str.len()
    exact_matches = exact_matches.sort_values(by='length')

    results = []
    for _, row in exact_matches.iterrows():
        results.append((row, 100))  

    results.extend(fuzzy_matches)

    results = sorted(results, key=lambda x: x[1], reverse=True)[:5]

    return results



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



