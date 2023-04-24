import joblib

if __name__ == "__main__":


    data = joblib.load('./tracking_results.pkl')

    print(data[1].keys())