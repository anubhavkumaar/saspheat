#!/usr/bin/env node

import { execSync } from 'child_process';

function run(command, description) {
  try {
    console.log(`\n📦 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} complete`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function deploy() {
  console.log('🚀 Starting deployment process...\n');

  run('npm run build', 'Building app');

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim().length > 0) {
      console.log('\n📝 Changes detected, committing...');
      run('git add .', 'Staging changes');
      const timestamp = new Date().toISOString();
      run(`git commit -m "Deploy: ${timestamp}"`, 'Committing changes');
    } else {
      console.log('\n✓ No changes to commit');
    }
  } catch (error) {
    console.error('Error checking git status:', error.message);
  }

  try {
    console.log('\n Checking for unpushed commits...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub');
  } catch (error) {
    console.log('ℹ️  No new commits to push (already up to date)');
  }

  run('firebase deploy', 'Deploying to Firebase');

  console.log('\n🎉 Deployment complete!\n');
  console.log('📊 Summary:');
  console.log('  ✅ Built app');
  console.log('  ✅ Committed changes');
  console.log('  ✅ Pushed to GitHub');
  console.log('  ✅ Deployed to Firebase\n');
}

deploy().catch(console.error);
