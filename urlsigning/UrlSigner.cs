using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace SignUrl {

  public struct GoogleSignedUrl {

    public static string Sign(string url, string keyString) {
      ASCIIEncoding encoding = new ASCIIEncoding();

      // converting key to bytes will throw an exception, need to replace '-' and '_' characters first.
      string usablePrivateKey = keyString.Replace("-", "+").Replace("_", "/");
      byte[] privateKeyBytes = Convert.FromBase64String(usablePrivateKey);

      Uri uri = new Uri(url);
      byte[] encodedPathAndQueryBytes = encoding.GetBytes(uri.LocalPath + uri.Query);

      // compute the hash
      HMACSHA1 algorithm = new HMACSHA1(privateKeyBytes);
      byte[] hash = algorithm.ComputeHash(encodedPathAndQueryBytes);

      // convert the bytes to string and make url-safe by replacing '+' and '/' characters
      string signature = Convert.ToBase64String(hash).Replace("+", "-").Replace("/", "_");
            
      // Add the signature to the existing URI.
      return uri.Scheme+"://"+uri.Host+uri.LocalPath + uri.Query +"&signature=" + signature;
    }
  }

  class Program {

    static void Main() {
    
      // Note: Generally, you should store your private key someplace safe
      // and read them into your code

      const string keyString = "YOUR_PRIVATE_KEY";
  
      // The URL shown in these examples is a static URL which should already
      // be URL-encoded. In practice, you will likely have code
      // which assembles your URL from user or web service input
      // and plugs those values into its parameters.
      const  string urlString = "YOUR_URL_TO_SIGN";
      
      string inputUrl = null;
      string inputKey = null;
    
      Console.WriteLine("Enter the URL (must be URL-encoded) to sign: ");
      inputUrl = Console.ReadLine();
      if (inputUrl.Length == 0) {
        inputUrl = urlString;
      }     
    
      Console.WriteLine("Enter the Private key to sign the URL: ");
      inputKey = Console.ReadLine();
      if (inputKey.Length == 0) {
        inputKey = keyString;
      }
      
      Console.WriteLine(GoogleSignedUrl.Sign(inputUrl,inputKey));
    }
  }
}
