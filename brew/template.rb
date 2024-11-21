class Khulnasoft < Formula
    desc "Khulnasoft CLI provides a full and flexible interface to interact with Khulnasoft."
    homepage "http://cli.khulnasoft.com"
    url "https://github.com/khulnasoft/cli/releases/download/{{ VERSION }}/khulnasoft-{{ VERSION }}-macos-x64.tar.gz"
    version "{{ VERSION }}"
    sha256 "{{ SHA256 }}"
  
    def install
      bin.install "khulnasoft"
    end
  
    test do
      system "#{bin}/khulnasoft version"
    end
  end