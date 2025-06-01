#!/usr/bin/env node

/**
 * 🚀 Smart GitHub Repository Creator
 * Creates GitHub repository automatically using GitHub API
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const { execSync } = require('child_process');

class SmartRepoCreator {
  constructor() {
    this.packageJson = this.loadPackageJson();
    this.repoName = this.packageJson.name || 'my-project';
    this.description = this.packageJson.description || 'A project built with Quasar Framework';
  }

  loadPackageJson() {
    try {
      return JSON.parse(fs.readFileSync('package.json', 'utf8'));
    } catch (error) {
      console.error('❌ Cannot read package.json');
      process.exit(1);
    }
  }

  async createRepository() {
    console.log('🚀 Creating GitHub repository automatically...');
    
    // Try different authentication methods
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    
    if (!token) {
      console.log('⚠️  No GitHub token found.');
      console.log('💡 Please create a Personal Access Token:');
      console.log('1. Go to: https://github.com/settings/tokens');
      console.log('2. Click "Generate new token (classic)"');
      console.log('3. Select "repo" scope');
      console.log('4. Copy the token');
      console.log('5. Set environment variable: GITHUB_TOKEN=your_token');
      console.log('');
      console.log('🔧 Alternative: Create repository manually:');
      console.log(`1. Go to: https://github.com/new`);
      console.log(`2. Repository name: ${this.repoName}`);
      console.log('3. Make it public');
      console.log('4. Click "Create repository"');
      console.log('5. Run: npm run release:connect');
      return false;
    }

    try {
      const octokit = new Octokit({
        auth: token,
      });

      // Get authenticated user
      const { data: user } = await octokit.rest.users.getAuthenticated();
      console.log(`👤 Authenticated as: ${user.login}`);

      // Create repository
      const { data: repo } = await octokit.rest.repos.create({
        name: this.repoName,
        description: this.description,
        private: false,
        auto_init: false,
      });

      console.log(`✅ Repository created successfully!`);
      console.log(`🔗 URL: ${repo.html_url}`);
      console.log(`📦 Clone URL: ${repo.clone_url}`);

      // Configure git remote
      try {
        execSync('git remote remove origin', { stdio: 'ignore' });
      } catch (e) {
        // Remote doesn't exist, that's fine
      }

      execSync(`git remote add origin ${repo.clone_url}`);
      console.log('🔗 Git remote configured');

      // Push to repository
      try {
        execSync('git push -u origin HEAD --tags', { stdio: 'inherit' });
        console.log('🎉 Code pushed to GitHub successfully!');
        return true;
      } catch (error) {
        console.log('⚠️  Push failed, but repository was created.');
        console.log('Run: git push -u origin HEAD --tags');
        return false;
      }

    } catch (error) {
      if (error.status === 422) {
        console.log('⚠️  Repository already exists');
        console.log('🔗 Configuring git remote...');
        
        try {
          execSync('git remote remove origin', { stdio: 'ignore' });
        } catch (e) {}
        
        execSync(`git remote add origin https://github.com/${process.env.GITHUB_USER || 'MohamedAboElnasrHassan'}/${this.repoName}.git`);
        
        try {
          execSync('git push -u origin HEAD --tags', { stdio: 'inherit' });
          console.log('🎉 Connected to existing repository!');
          return true;
        } catch (pushError) {
          console.log('⚠️  Push failed. Repository exists but push failed.');
          return false;
        }
      } else {
        console.error('❌ Error creating repository:', error.message);
        return false;
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new SmartRepoCreator();
  creator.createRepository().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = SmartRepoCreator;
